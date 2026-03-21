# HACKERNEWS

Show HN: ExplodeView – embed interactive exploded-view CAD diagrams in 2 lines of HTML

I'm a mechanical engineer. I build automated bicycle washing stations (hardware, PLC, the whole stack). We were doing assembly documentation the usual way: static PDFs, Autodesk Viewer embeds, screenshots. All of it is terrible for communicating how a machine actually goes together.

So I built this.

**What it is:** A 27KB vanilla JS widget that takes a processed STEP file and renders an interactive exploded-view diagram in the browser. You can expand/collapse assembly levels with + and -, click a sub-assembly to highlight and isolate it (the highlighted group collapses while everything else stays exploded), rotate freely, and auto-rotate for display purposes.

**Embed looks like this:**

```html
<script src="https://explodeview.com/widget.js"></script>
<explode-view config="./machine.config.json"></explode-view>
```

That's it. Loads Three.js from CDN, zero npm dependencies, works in any HTML page.

**The Python CLI** takes your STEP/STP file and outputs web-ready STL parts with auto-detected assembly hierarchy. It figures out the part tree from the STEP structure, assigns materials (brushed stainless, matte black ABS, grey rubber, metallic blue), and generates the config. You point it at a STEP file, it spits out a folder you drop on any static host.

**The demo is a real 399-part industrial machine** — not a toy model, not a gear assembly. The machine my company actually manufactures. https://explodeview.com/demo/

I looked at the alternatives before building this. Sketchfab is great for visual models but has no concept of assembly hierarchy or exploded views. Autodesk Viewer does explode but it's a full platform, requires their cloud, and the embed story is painful. Nothing I found did assembly-aware exploded views with sub-assembly isolation that you could self-host and embed trivially.

**Use cases I had in mind:** manufacturing documentation, e-commerce product pages for complex hardware, engineering handoff, education.

**Pricing:** Free MIT open source (self-host, process your own files). Pro at €49/mo adds cloud STEP processing via API so you skip running the CLI. Enterprise at €299/mo for multi-user, private hosting, SLA.

GitHub (MIT): https://github.com/vvlars-cmd/explodeview
Live demo: https://explodeview.com/demo/
Landing: https://explodeview.com

Happy to answer questions about the STEP parsing, the Three.js rendering approach, or why I made certain tradeoffs in the widget design.

---

# REDDIT WEBDEV

**Title:** I built a zero-dependency 3D CAD explode viewer in 27KB of vanilla JS — here's what I learned

---

Hey r/webdev,

I've been working on a side project that scratches a very specific itch: embedding interactive, exploded-view CAD diagrams on a webpage without pulling in a massive framework or paying for a SaaS product. The result is **ExplodeView** — MIT licensed, open source, and live on GitHub at https://github.com/vvlars-cmd/explodeview.

**What it does**

You give it a STEP/STP file (the standard CAD exchange format), a Python CLI converts it into individual STL parts with assembly metadata, and then a 27KB vanilla JS library renders the whole thing in-browser with Three.js loaded from CDN. Click a sub-assembly and it collapses while the rest stay exploded. You can orbit, zoom, click individual parts — it behaves like something you'd expect from a desktop CAD viewer, but it's just a `<script>` tag on a webpage.

Live demo (399-part industrial machine): https://explodeview.com/demo/

**The stack**

- Vanilla JS, no build step, no npm install, no bundler required
- Three.js via CDN (the one "dependency" that isn't bundled)
- Python CLI for the STEP → STL conversion pipeline
- PBR materials with metalness/roughness, auto-rotate, configurable lighting
- Config is just a JSON object — colors, explosion distance, camera position, all of it

The embed API is pretty minimal:

```js
const viewer = new ExplodeView('#container', {
  model: '/parts/',
  explodeFactor: 1.5,
  autoRotate: true
});
```

**Why I built it this way**

I'm a mechanical engineer who actually builds machines. The demo model is a bicycle washing machine I designed — 399 real parts, real sub-assembly structure. I needed a way to put assembly documentation on a website without asking clients to install anything or paying $X/month for a 3D SaaS tool that does 10x more than I need.

The zero-dependency approach was a deliberate constraint. Every time I added something it had to earn its place. Keeping it at 27KB meant being honest about what the core problem actually was: parse some geometry, maintain a scene graph, handle sub-assembly state, get out of the way.

**What I learned building a 3D web viewer**

A few things that surprised me or took longer than expected:

1. **Sub-assembly state is the hard part.** Rendering geometry is table stakes with Three.js. The tricky bit is maintaining a tree of assemblies and sub-assemblies so that collapsing one node doesn't accidentally affect its siblings. I ended up modeling it almost like a React component tree — each node knows its own state and its children's states.

2. **STEP is not a friendly format.** It's a text-based ISO standard that encodes geometry *and* topology *and* assembly hierarchy all in one file. Writing a parser that extracts meaningful sub-assembly groupings without a full CAD kernel is a project in itself. The Python CLI leans on existing STEP tooling for the geometry, but the hierarchy extraction is custom.

3. **PBR materials make a huge perceptual difference.** I went back and forth on whether to bother with metalness/roughness maps on static STL geometry (no UV maps, per-part colors only). Turns out even a simple metallic sheen with a roughness value of ~0.4 makes parts read as "real object" rather than "render." Worth the extra setup.

4. **CDN-loaded Three.js is fine, actually.** I spent time worrying about whether loading Three.js from a CDN was a problem and it really isn't for this use case. It's cached aggressively, it's on a fast CDN, and it lets the core library stay at 27KB without compromising on rendering capability.

5. **Auto-rotation needs a speed that feels physical.** Too fast looks like a toy demo. Too slow and users don't realize they can interact with it. I ended up tuning it by watching non-engineers use the demo — the rotation speed that made people reach for their mouse was the right one.

---

If you work on product pages, documentation sites, or anything where you need to show how something goes together, hopefully this saves you some time. Contributions and issues welcome on GitHub.

Happy to answer questions about the architecture, the Python pipeline, or the Three.js scene graph setup.

---

# REDDIT ENGINEERING

**I built an open-source tool that parses STEP assembly hierarchies and renders interactive exploded views for the web — here's how it works**

---

For the past few months I've been building automation equipment for a bicycle washing station product. Like most ME work, the design lives in CAD as a multi-level STEP assembly — hundreds of parts, nested sub-assemblies, the usual. Every time I needed to share documentation with a technician or put something on a product page, I'd export a flat rendering and lose all the structural context. No interactivity, no part breakdown, just a picture.

I couldn't find a lightweight open-source tool that took a STEP file and turned it into something a browser could render interactively. So I built one.

**The hard part: STEP assembly hierarchy**

STEP AP214 encodes assembly structure through NAUO (Next Assembly Usage Occurrence) relationships. These link parent assemblies to child components and sub-assemblies through a graph that isn't always straightforward to traverse. pythonOCC (the Python wrapper for OpenCascade) gives you access to this graph, but you still have to walk it correctly to reconstruct the tree — figuring out which shapes belong to which sub-assembly, what the transform chain is for each leaf part, and how to preserve the hierarchy for the explode animation rather than just flattening everything into a soup of geometry.

The tool auto-detects sub-assemblies from those NAUO relationships and builds a proper tree structure before anything gets sent to the renderer. That means when you explode the view, groups of parts move together as logical units — a bolt pattern stays together, a valve block stays together — rather than every part flying off independently.

**Material assignment**

CAD files rarely carry render-ready material data, so the tool uses part naming conventions and geometry heuristics to assign physically-based materials: brushed steel, matte ABS, rubber seals, anodized aluminum, coated surfaces. It's not perfect but it gets you 80% of the way to something that looks like a real product rather than a gray blob.

**What it produces**

A self-contained interactive 3D viewer you can embed on any webpage. Click a part to highlight it, step through an exploded animation, navigate the parts tree. No plugin, no paid license.

**The demo**

The live demo runs the actual washing station assembly — 399 parts across multiple sub-assemblies. You can see the hierarchy detection and explode behavior on real industrial geometry:

https://explodeview.com/demo/

**Use cases I had in mind**

- Product pages that let customers actually understand what they're buying
- Service manuals where a technician can click through the disassembly sequence
- Training documentation without needing everyone to have CAD access
- Internal design reviews where you want non-CAD people to follow along

**It's MIT licensed and on GitHub**

https://github.com/vvlars-cmd/explodeview

Stack is pythonOCC for STEP parsing + Three.js for the web renderer. Happy to answer questions about the STEP hierarchy traversal, the geometry pipeline, or how the explode logic works. If you've dealt with this problem differently — especially anyone working with large assemblies or doing this at scale — I'm curious what approaches you've used.

---

# LINKEDIN

After 3 years building cycleWASH — an automated bicycle washing machine — I kept running into the same frustrating wall.

We design complex assemblies (our flagship unit has 399 parts). But when it came time to show the machine on our product page? Static images. Maybe a GIF if we were feeling fancy.

Customers couldn't see *how* it works. Investors couldn't explore the engineering. We looked like every other product page from 2012.

So I built the tool I needed.

**Introducing ExplodeView** — an open source tool that turns STEP/CAD files into interactive 3D exploded views you can embed on any website.

→ Python CLI processes your STEP file
→ Outputs a single 27KB JS widget
→ Drop it into any webpage, no server required

Live demo (my actual machine, all 399 parts): https://explodeview.com/demo/

The insight: I'm not a developer who stumbled into CAD. I'm a mechanical engineer who had to learn to code to solve my own problem. That's an unfair advantage when building tools for engineers.

It's MIT licensed and free to use. For teams who want hosting, analytics, and white-labeling — Pro is €49/mo, Enterprise €299/mo.

GitHub: https://github.com/vvlars-cmd/explodeview
Website: https://explodeview.com

If you design machines and hate how they look on your website — this is for you.

#MechanicalEngineering #CAD #OpenSource #ProductDesign #MadeInGermany #Manufacturing #Startup #WebDevelopment #Engineering

---

# PRODUCTHUNT

**Tagline**
Turn CAD files into interactive 3D exploded views — free

---

**Description**

ExplodeView lets you embed interactive 3D exploded views directly on your website — no CAD software required for your visitors. Just upload your CAD file, and ExplodeView generates a live, explorable 3D visualization that anyone can spin, zoom, and explode in their browser.

Built for hardware founders, mechanical engineers, and product teams who are tired of sending static screenshots or making customers download bloated viewers. If you've ever shipped a physical product and wished your docs, landing page, or support portal could show exactly how it comes apart — this is for you.

It's open source, works with standard CAD formats, and the demo speaks louder than any description. Click the link and explode something.

---

**First comment (from maker Sachin Kumar)**

Hey Product Hunt! I'm Sachin — mechanical engineer and founder of cycleWASH, a company that makes automated bicycle washing machines. Building hardware means I live in CAD files. But every time I needed to show someone how a product assembled, I was stuck exporting flat images or walking people through Fusion 360 over a screen share.

ExplodeView started as a tool I built for myself. I wanted customers, partners, and manufacturers to be able to look at our machine and instantly understand how it goes together — right from the browser, no installs, no exports, no back-and-forth. The demo at explodeview.com/demo is the thing I wish existed when I started building physical products. Would love your feedback, especially from anyone else shipping hardware. Drop your questions below!

---

**5 Key Features**

- **CAD to web in seconds** — upload your file and get an embeddable interactive 3D viewer instantly
- **True exploded views** — parts separate and animate exactly as they would in a real assembly drawing
- **Zero friction for viewers** — runs entirely in the browser, no plugins or CAD licenses needed
- **Open source** — full code on GitHub, self-host it, fork it, extend it
- **Built for product pages** — embed on your site to replace static images with live, explorable 3D

---

