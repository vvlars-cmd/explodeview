#!/usr/bin/env python3
"""
STP Viewer — Process a STEP file into viewer-ready assets.

Usage:
  python3 process-stp.py <input.step> <output_dir> [--assemblies auto|manual]

Output:
  <output_dir>/
    parts/           — Individual STL files per solid
    manifest.json    — Part metadata (centers, bounding boxes, file sizes)
    assemblies.json  — Assembly grouping (auto-detected from STEP hierarchy)
    viewer.html      — Standalone preview page
"""

import sys
import os
import json
import re
import shutil
import argparse

def main():
    parser = argparse.ArgumentParser(description='Process STEP file for 3D viewer widget')
    parser.add_argument('input', help='Path to .step/.stp file')
    parser.add_argument('output', help='Output directory for viewer assets')
    parser.add_argument('--name', default=None, help='Product display name')
    parser.add_argument('--brand', default='', help='Brand name')
    parser.add_argument('--tolerance', type=float, default=0.5, help='Mesh tolerance (lower = finer)')
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: File not found: {args.input}")
        sys.exit(1)

    parts_dir = os.path.join(args.output, 'parts')
    os.makedirs(parts_dir, exist_ok=True)

    product_name = args.name or os.path.splitext(os.path.basename(args.input))[0]

    print(f"╔══════════════════════════════════════╗")
    print(f"║  STP Viewer — Processing STEP File   ║")
    print(f"╚══════════════════════════════════════╝")
    print(f"  Input:  {args.input}")
    print(f"  Output: {args.output}")
    print(f"  Name:   {product_name}")
    print()

    # ── Step 1: Extract solids ──
    print("[1/4] Loading STEP file...")
    from OCP.STEPControl import STEPControl_Reader
    from OCP.TopExp import TopExp_Explorer
    from OCP.TopAbs import TopAbs_SOLID
    from OCP.BRepMesh import BRepMesh_IncrementalMesh
    from OCP.BRepBndLib import BRepBndLib
    from OCP.Bnd import Bnd_Box
    from OCP.StlAPI import StlAPI_Writer
    from OCP.IFSelect import IFSelect_RetDone

    reader = STEPControl_Reader()
    status = reader.ReadFile(args.input)
    if status != IFSelect_RetDone:
        print(f"  Error: Failed to read STEP file (status={status})")
        sys.exit(1)

    reader.TransferRoots()
    shape = reader.OneShape()

    exp = TopExp_Explorer(shape, TopAbs_SOLID)
    solids = []
    while exp.More():
        solids.append(exp.Current())
        exp.Next()

    print(f"  Found {len(solids)} solids")

    # ── Step 2: Export STL parts ──
    print(f"[2/4] Exporting {len(solids)} parts...")
    manifest = []
    for idx, solid in enumerate(solids):
        bbox = Bnd_Box()
        BRepBndLib.Add_s(solid, bbox)
        xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
        center = [(xmin+xmax)/2, (ymin+ymax)/2, (zmin+zmax)/2]
        size = [xmax-xmin, ymax-ymin, zmax-zmin]

        BRepMesh_IncrementalMesh(solid, args.tolerance, False, args.tolerance, True)

        filename = f"part_{idx:04d}.stl"
        filepath = os.path.join(parts_dir, filename)
        writer = StlAPI_Writer()
        writer.Write(solid, filepath)

        file_size = os.path.getsize(filepath) if os.path.exists(filepath) else 0

        manifest.append({
            "index": idx,
            "file": filename,
            "center": [round(c, 2) for c in center],
            "bbox": [round(s, 2) for s in size],
            "fileSize": file_size,
        })

        if (idx + 1) % 50 == 0 or idx == len(solids) - 1:
            print(f"  Exported {idx + 1}/{len(solids)}")

    # Filter degenerate parts
    valid = [p for p in manifest if p['fileSize'] > 2000]
    print(f"  Valid parts: {len(valid)} (filtered {len(manifest) - len(valid)} degenerate)")

    manifest_path = os.path.join(args.output, 'manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    # ── Step 3: Auto-detect assemblies from STEP hierarchy ──
    print("[3/4] Detecting assemblies from STEP hierarchy...")
    assemblies = detect_assemblies(args.input, manifest)

    asm_path = os.path.join(args.output, 'assemblies.json')
    with open(asm_path, 'w') as f:
        json.dump(assemblies, f, indent=2)

    print(f"  Found {len(assemblies)} assemblies:")
    for a in assemblies:
        count = a['indices'][1] - a['indices'][0]
        print(f"    {a['name']}: {count} parts [{a['indices'][0]}-{a['indices'][1]})")

    # ── Step 4: Generate config ──
    print("[4/4] Generating viewer config...")
    config = {
        "productName": product_name,
        "brand": args.brand,
        "totalParts": len(valid),
        "totalSolids": len(manifest),
        "assemblies": assemblies,
    }
    config_path = os.path.join(args.output, 'config.json')
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

    # Copy viewer files
    widget_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dist_dir = os.path.join(widget_dir, 'dist')
    if os.path.exists(dist_dir):
        for fname in os.listdir(dist_dir):
            src = os.path.join(dist_dir, fname)
            dst = os.path.join(args.output, fname)
            if os.path.isfile(src):
                shutil.copy2(src, dst)
        print(f"  Copied viewer files to {args.output}")

    print()
    print(f"✓ Done! Assets ready in: {args.output}")
    print(f"  Embed in your page:")
    print(f'    <div id="stp-viewer" data-src="{args.output}"></div>')
    print(f'    <script src="{args.output}/stp-viewer.js"></script>')


def detect_assemblies(step_file, manifest):
    """Parse STEP file to extract assembly hierarchy and map to solid indices."""
    with open(step_file, 'r', errors='ignore') as f:
        content = f.read()

    # Parse NAUO (assembly relationships)
    nauo_entries = re.findall(
        r"NEXT_ASSEMBLY_USAGE_OCCURRENCE\s*\([^,]*,[^,]*,[^,]*,\s*#(\d+)\s*,\s*#(\d+)\s*,",
        content, re.DOTALL
    )

    children = {}
    for parent, child in nauo_entries:
        if parent not in children:
            children[parent] = []
        children[parent].append(child)

    # PD -> Product name mapping
    pdf_to_prod = {}
    for m in re.finditer(r"#(\d+)\s*=\s*PRODUCT_DEFINITION_FORMATION\s*\([^,]*,[^,]*,\s*#(\d+)\s*\)", content):
        pdf_to_prod[m.group(1)] = m.group(2)

    pd_to_pdf = {}
    for m in re.finditer(r"#(\d+)\s*=\s*PRODUCT_DEFINITION\s*\([^,]*,[^,]*,\s*#(\d+)\s*,", content):
        pd_to_pdf[m.group(1)] = m.group(2)

    prod_names = {}
    for m in re.finditer(r"#(\d+)\s*=\s*PRODUCT\s*\(\s*'([^']*)'", content):
        prod_names[m.group(1)] = m.group(2)

    pd_to_name = {}
    for pd_id, pdf_id in pd_to_pdf.items():
        prod_id = pdf_to_prod.get(pdf_id)
        if prod_id and prod_id in prod_names:
            pd_to_name[pd_id] = prod_names[prod_id]

    # Find root
    root = None
    for pd_id, name in pd_to_name.items():
        if pd_id in children and len(children[pd_id]) > 5:
            root = pd_id
            break

    if not root:
        # Fallback: spatial grouping
        return auto_group_spatial(manifest)

    # Get unique top-level children
    top_kids = []
    seen_names = set()
    for kid in children.get(root, []):
        name = pd_to_name.get(kid, '')
        if name and name not in seen_names:
            seen_names.add(name)
            top_kids.append(kid)

    if len(top_kids) < 2:
        return auto_group_spatial(manifest)

    # DFS to count leaf instances per top-level assembly
    assemblies_set = set(children.keys())

    def count_leaves(pd_id, visited=None):
        if visited is None:
            visited = set()
        if pd_id in visited:
            return 1
        visited.add(pd_id)
        kids = children.get(pd_id, [])
        if not kids:
            return 1
        total = 0
        for c in kids:
            total += count_leaves(c, visited)
        return total

    # Build assembly ranges by DFS order
    assemblies = []
    current_idx = 0

    # Palette for auto-coloring
    palette = [
        "#0055A4", "#FFD100", "#3A7FBF", "#FFBA00",
        "#003D7A", "#FFC629", "#6699CC", "#FF8844",
        "#44AA88", "#CC5577", "#8866DD", "#55BBAA",
    ]

    for i, kid in enumerate(top_kids):
        name = pd_to_name.get(kid, f'Assembly {i+1}')
        leaf_count = count_leaves(kid)

        # Clean up name: remove part numbers, decode unicode escapes
        display_name = name
        display_name = re.sub(r'\\X\\[A-Fa-f0-9]{2}', '', display_name)
        display_name = re.sub(r'\d{4}\.\w+-[\d.]+-\d+_', '', display_name)
        display_name = display_name.strip('_ ').upper() or f'ASSEMBLY {i+1}'

        assemblies.append({
            "key": name,
            "name": display_name,
            "subtitle": "",
            "detail": "",
            "color": palette[i % len(palette)],
            "indices": [current_idx, current_idx + leaf_count],
        })
        current_idx += leaf_count

    # Handle remaining unassigned parts
    total_parts = len(manifest)
    if current_idx < total_parts:
        assemblies.append({
            "key": "Other",
            "name": "OTHER COMPONENTS",
            "subtitle": "",
            "detail": "",
            "color": palette[len(assemblies) % len(palette)],
            "indices": [current_idx, total_parts],
        })

    return assemblies


def auto_group_spatial(manifest):
    """Fallback: group parts by spatial position."""
    valid = [p for p in manifest if p['fileSize'] > 2000]
    n = len(valid)
    if n == 0:
        return []

    # Simple approach: split into roughly equal groups by index
    group_size = max(1, n // 6)
    palette = ["#0055A4", "#FFD100", "#3A7FBF", "#FFBA00", "#003D7A", "#FFC629"]
    assemblies = []
    for i in range(0, n, group_size):
        end = min(i + group_size, n)
        assemblies.append({
            "key": f"group_{len(assemblies)}",
            "name": f"ASSEMBLY {len(assemblies) + 1}",
            "subtitle": "",
            "detail": "",
            "color": palette[len(assemblies) % len(palette)],
            "indices": [i, end],
        })
    return assemblies


if __name__ == '__main__':
    main()
