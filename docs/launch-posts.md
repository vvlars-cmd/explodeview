# Launch Posts

## HackerNews — Show HN

**Title:** Show HN: ExplodeView – Embed interactive 3D exploded-view CAD viewers in 2 lines

**Body:**

I'm a mechanical engineer who builds automated bicycle washing machines. We use STEP files constantly — assemblies with hundreds of parts — and I kept running into the same problem: there's no good way to share them on the web so customers, dealers, or service techs can actually understand how something goes together.

Sketchfab lets you view 3D models, Autodesk Viewer is heavy enterprise software, but nothing does what a classic exploded-view diagram does: show how an assembly breaks apart, highlight sub-assemblies, let someone click into a specific module. That interaction is what makes assembly drawings useful and none of the web-based tools support it in a lightweight embeddable form.

So I built ExplodeView.

**How it works:**

A Python CLI reads your STEP file, parses the assembly hierarchy (using pythonOCC/OCCT under the hood), and exports each part as a pre-positioned STL. It also generates a JSON manifest with the hierarchy, part names, and metadata. The output is a folder of static files — no server required.

The viewer is a 27KB vanilla JS widget with zero npm dependencies. It loads Three.js from CDN. Drop two lines of HTML on any page and you get:

- Smooth explode/collapse animation across the full assembly
- Sub-assembly awareness: click a sub-assembly to highlight and collapse it while the rest stays exploded
- Realistic PBR materials (brushed steel, matte ABS, rubber) auto-assigned by part name heuristics
- Auto-rotate, zoom, pan
- Customizable branding/colors

The demo uses a real 399-part assembly from my own machines. It's not a toy example.

MIT licensed. GitHub: https://github.com/vvlars-cmd/explodeview

Happy to answer questions about the STEP parsing, the hierarchy detection logic, or the material heuristics.

---

## Reddit /r/webdev

**Title:** I built an open-source tool that turns STEP/CAD files into interactive 3D exploded-view widgets you can embed in 2 lines of HTML

**Body:**

Hey /r/webdev — I'm a mechanical engineer by background, and I built something at the intersection of CAD and web.

**The problem:** STEP files are the standard format for 3D mechanical assemblies (think: a product with 50–500 parts). There's no lightweight way to put one on a webpage as an interactive exploded view where you can isolate sub-assemblies.

**What I built:** ExplodeView. A Python CLI that processes STEP files into web-ready static assets, plus a 27KB vanilla JS viewer widget.

The interesting bits:

- Zero npm dependencies. Three.js loads from CDN. Embed is `<script>` + `<div>` tag.
- Sub-assembly highlighting: click a group of parts to collapse just that sub-assembly while the rest stays exploded
- PBR materials auto-assigned from part name heuristics
- Purely static files — host on GitHub Pages, S3, Netlify, whatever

Demo: https://vvlars-cmd.github.io/explodeview/

MIT licensed: https://github.com/vvlars-cmd/explodeview

Would love feedback on the embed API.
