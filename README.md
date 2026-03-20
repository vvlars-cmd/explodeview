# ExplodeView

**Turn any STEP/CAD file into an interactive 3D exploded-view on your website.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/explodeview)](https://www.npmjs.com/package/explodeview)

<p align="center">
  <img src="docs/hero.gif" alt="ExplodeView Demo" width="720" />
</p>

ExplodeView takes STEP/STP CAD assembly files and creates embeddable, interactive 3D viewers with:

- **Exploded views** — blow apart assemblies to show internal components
- **Sub-assembly highlighting** — click any assembly to isolate and inspect it
- **Realistic materials** — brushed steel, matte plastic, rubber, metallic finishes
- **Full controls** — zoom, rotate, collapse/expand, auto-orbit
- **Customizable branding** — your logo, colors, captions
- **Zero dependencies** — single 27KB script, loads Three.js from CDN
- **Responsive** — works on desktop, tablet, mobile

## Quick Start

### 1. Process your STEP file

```bash
pip install cadquery OCP
python3 bin/explodeview-process.py input.step output/ --name "My Product"
```

### 2. Embed in your page

```html
<div data-stp-viewer="/output/"
     data-brand="Your Brand"
     data-product-name="Product Name"
     style="width:100%; height:600px">
</div>
<script src="https://unpkg.com/explodeview"></script>
```

That's it. Two lines.

## Installation

### npm
```bash
npm install explodeview
```

### CDN
```html
<script src="https://unpkg.com/explodeview"></script>
```

### Self-hosted
Download `dist/explodeview.js` and serve it from your own server.

## Processing STEP Files

The CLI tool converts STEP/STP files into web-ready assets:

```bash
python3 bin/explodeview-process.py <input.step> <output_dir> [options]

Options:
  --name        Product display name
  --brand       Brand name
  --tolerance   Mesh quality (default: 0.5, lower = finer)
```

**Requirements:** Python 3.8+ with `cadquery` and `OCP` packages.

```bash
pip install cadquery OCP
```

**Output structure:**
```
output/
├── parts/           # Individual STL meshes per solid
├── manifest.json    # Part metadata (centers, bounding boxes)
├── assemblies.json  # Auto-detected assembly grouping
└── config.json      # Viewer configuration
```

## JavaScript API

```js
// Programmatic initialization
const viewer = await STPViewer.init({
  container: '#my-viewer',
  src: '/path/to/processed/assets/',
  brand: 'Your Brand',
  productName: 'Product Name',
  assemblies: [],  // auto-loaded from assemblies.json
  captions: {
    brand: 'Your Brand',
    productName: 'Product Name',
    loaderTitle: 'Loading...',
    loaderText: 'Preparing 3D model...',
    btnOverview: 'Overview',
    btnCollapse: 'Collapse',
    btnExplode: 'Explode',
  }
});
```

### Custom Assemblies

Override auto-detected assemblies with your own grouping:

```js
STPViewer.init({
  container: '#viewer',
  src: '/assets/',
  assemblies: [
    {
      key: 'frame',
      name: 'MAIN FRAME',
      subtitle: 'Structural Steel',
      detail: 'Load-bearing frame assembly.',
      color: '#0055A4',
      indices: [0, 150],  // solid index range
    },
    {
      key: 'motor',
      name: 'DRIVE UNIT',
      subtitle: 'Electric Motor Assembly',
      color: '#FFD100',
      indices: [150, 200],
    }
  ]
});
```

### Custom Materials

Each assembly can have custom material properties in the assemblies JSON:

```json
{
  "key": "covers",
  "name": "PROTECTIVE COVERS",
  "color": "#2A2A30",
  "material": {
    "metalness": 0.0,
    "roughness": 0.85
  }
}
```

## Features

| Feature | Free (MIT) | Pro |
|---------|-----------|-----|
| 3D exploded view | Yes | Yes |
| Assembly highlighting | Yes | Yes |
| Collapse/expand controls | Yes | Yes |
| Auto-rotate | Yes | Yes |
| Custom branding | Yes | Yes |
| Embed on your site | Yes | Yes |
| STEP processing CLI | Yes | Yes |
| Cloud processing API | — | Yes |
| Priority support | — | Yes |
| Custom materials | — | Yes |
| Animation export (video) | — | Yes |
| White-label (remove branding) | — | Yes |
| AR/VR export | — | Coming |

## Who is this for?

- **Manufacturing companies** — showcase products on your website
- **E-commerce** — interactive product pages that convert
- **Engineering docs** — maintenance and assembly manuals
- **Sales teams** — impressive presentations and proposals
- **Education** — teach mechanical engineering concepts

## Examples

### Full-page viewer
```html
<div id="viewer"
     data-stp-viewer="/assets/"
     data-brand="cycleWASH"
     data-product-name="Station Basic"
     style="width:100vw; height:100vh">
</div>
<script src="https://unpkg.com/explodeview"></script>
```

### Embedded in a product page
```html
<div class="product-3d"
     data-stp-viewer="/assets/my-machine/"
     data-brand="ACME Corp"
     data-product-name="Widget Pro 3000"
     style="width:100%; height:500px; border-radius:12px; overflow:hidden">
</div>
<script src="https://unpkg.com/explodeview"></script>
```

## Browser Support

Chrome 90+, Firefox 90+, Safari 15+, Edge 90+

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — free for personal and commercial use.

---

**Built by [Sachin Kumar](https://github.com/sachin)** — creator of [cycleWASH](https://cyclewash.com), the world's first automated bicycle washing station.
