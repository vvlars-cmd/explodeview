/**
 * STP Viewer Widget — Embeddable 3D exploded-view viewer for STEP files
 *
 * Usage:
 *   <div id="stp-viewer" data-src="/path/to/processed/assets/"></div>
 *   <script src="/path/to/stp-viewer.js"></script>
 *
 * Or programmatic:
 *   STPViewer.init({ container: '#my-div', src: '/assets/', brand: 'cycleWASH' });
 */

(function () {
  'use strict';

  const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.170.0';

  // ─── Styles ───
  function injectStyles(container) {
    const style = document.createElement('style');
    style.textContent = `
      .stpv { position:relative; width:100%; height:100%; min-height:500px; background:#0a0e1a; overflow:hidden; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; color:#fff; --blue:#0055A4; --yellow:#FFD100; }
      .stpv canvas { display:block; width:100%; height:100%; }

      /* Loader */
      .stpv-loader { position:absolute; inset:0; background:#0a0e1a; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:100; transition:opacity 1s; }
      .stpv-loader.hidden { opacity:0; pointer-events:none; }
      .stpv-loader h2 { font-size:1.5rem; font-weight:200; letter-spacing:0.3em; }
      .stpv-loader h2 b { font-weight:700; color:var(--yellow); }
      .stpv-loader-bar { width:200px; height:2px; background:#1a1a2a; margin-top:1.2rem; border-radius:1px; overflow:hidden; }
      .stpv-loader-fill { height:100%; width:0%; background:linear-gradient(90deg,var(--blue),var(--yellow)); transition:width 0.2s; }
      .stpv-loader-text { font-size:0.6rem; color:#445; letter-spacing:0.12em; margin-top:0.8rem; }

      /* Top bar */
      .stpv-topbar { position:absolute; top:0; left:0; right:0; height:44px; display:flex; align-items:center; justify-content:space-between; padding:0 16px; background:rgba(0,0,0,0.5); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid rgba(255,255,255,0.06); z-index:20; }
      .stpv-brand { font-size:0.75rem; font-weight:200; letter-spacing:0.2em; text-transform:uppercase; }
      .stpv-brand b { font-weight:700; color:var(--yellow); }
      .stpv-nav { display:flex; gap:4px; }
      .stpv-btn { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#889; padding:5px 14px; font-size:0.6rem; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; border-radius:4px; font-family:inherit; transition:all 0.25s; }
      .stpv-btn:hover { background:rgba(0,85,164,0.12); border-color:rgba(0,85,164,0.4); color:#fff; }
      .stpv-btn.active { background:rgba(0,85,164,0.18); border-color:rgba(0,85,164,0.5); color:#4da6ff; }

      /* Left nav */
      .stpv-leftnav { position:absolute; left:12px; top:50%; transform:translateY(-50%); z-index:15; display:flex; flex-direction:column; gap:3px; }
      .stpv-nav-item { display:flex; align-items:center; gap:8px; padding:7px 10px; cursor:pointer; border:1px solid rgba(255,255,255,0.05); border-radius:5px; background:rgba(0,0,0,0.3); backdrop-filter:blur(6px); min-width:140px; transition:all 0.3s; }
      .stpv-nav-item:hover { border-color:rgba(255,255,255,0.12); }
      .stpv-nav-item.active { border-color:currentColor; background:rgba(0,85,164,0.1); }
      .stpv-nav-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; transition:all 0.3s; }
      .stpv-nav-item.active .stpv-nav-dot { width:9px; height:9px; box-shadow:0 0 8px currentColor; }
      .stpv-nav-label { font-size:0.5rem; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.2); font-weight:500; transition:all 0.3s; white-space:nowrap; }
      .stpv-nav-item.active .stpv-nav-label { color:inherit; font-weight:700; }

      /* Right controls */
      .stpv-controls { position:absolute; right:12px; top:50%; transform:translateY(-50%); z-index:15; display:flex; flex-direction:column; gap:3px; padding:6px; background:rgba(0,0,0,0.35); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.05); border-radius:8px; }
      .stpv-cbtn { width:32px; height:32px; border-radius:5px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); color:#778; font-size:0.9rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.25s; font-family:inherit; }
      .stpv-cbtn:hover { background:rgba(0,85,164,0.12); border-color:rgba(0,85,164,0.35); color:#fff; }
      .stpv-cbtn.active { background:rgba(0,85,164,0.18); border-color:rgba(0,85,164,0.45); color:#4da6ff; }
      .stpv-cdiv { width:20px; height:1px; background:rgba(255,255,255,0.06); margin:1px auto; }

      /* Assembly info overlay */
      .stpv-info { position:absolute; left:12px; bottom:16px; z-index:15; pointer-events:none; opacity:0; transform:translateY(10px); transition:all 0.5s; max-width:280px; }
      .stpv-info.visible { opacity:1; transform:translateY(0); }
      .stpv-info-num { font-size:0.5rem; letter-spacing:0.3em; font-weight:500; }
      .stpv-info-name { font-size:1.5rem; font-weight:800; letter-spacing:0.02em; line-height:1.1; margin-top:4px; text-shadow:0 2px 10px rgba(0,0,0,0.5); }
      .stpv-info-sub { font-size:0.7rem; font-weight:300; color:rgba(255,255,255,0.55); margin-top:4px; letter-spacing:0.04em; text-shadow:0 1px 4px rgba(0,0,0,0.4); }
      .stpv-info-detail { font-size:0.6rem; color:rgba(255,255,255,0.35); margin-top:8px; line-height:1.6; }
      .stpv-info-line { width:30px; height:2px; margin-top:8px; border-radius:1px; }
    `;
    container.appendChild(style);
  }

  // ─── HTML Template ───
  function buildUI(container, config) {
    // All captions are customizable via config
    const captions = Object.assign({
      brand: '',
      productName: '3D Viewer',
      loaderTitle: '',
      loaderText: 'Initializing 3D engine...',
      btnOverview: 'Overview',
      btnCollapse: 'Collapse',
      btnExplode: 'Explode',
      btnExpand: '+',
      btnContract: '−',
      btnAutoRotate: '↻',
      btnStopRotate: '■',
      btnFreeRotate: '⚘',
      btnReset: '↺',
      titleExpand: 'Expand explosion',
      titleContract: 'Collapse',
      titleAutoRotate: 'Auto Rotate',
      titleStopRotate: 'Stop rotation',
      titleFreeRotate: 'Free 3D rotate',
      titleReset: 'Reset view',
    }, config.captions || {});

    // Build display title: "brand productName" or just productName
    const brand = captions.brand || config.brand || '';
    const product = captions.productName || config.productName || '';
    const fullTitle = brand && product ? `${brand} ${product}` : brand || product || '3D Viewer';

    // Loader title defaults to fullTitle
    const loaderTitle = captions.loaderTitle || fullTitle;

    // Format brand: bold the last word
    function formatBrand(text) {
      if (!text) return '3D Viewer';
      return text.replace(/(\S+)\s*$/, '<b>$1</b>');
    }

    container.innerHTML = `
      <div class="stpv">
        <div class="stpv-loader">
          <h2>${formatBrand(loaderTitle)}</h2>
          <div class="stpv-loader-bar"><div class="stpv-loader-fill"></div></div>
          <div class="stpv-loader-text">${captions.loaderText}</div>
        </div>
        <div class="stpv-topbar">
          <div class="stpv-brand">${formatBrand(fullTitle)}</div>
          <div class="stpv-nav">
            <button class="stpv-btn active" data-action="overview">${captions.btnOverview}</button>
            <button class="stpv-btn" data-action="collapse">${captions.btnCollapse}</button>
            <button class="stpv-btn" data-action="explode">${captions.btnExplode}</button>
          </div>
        </div>
        <div class="stpv-leftnav"></div>
        <div class="stpv-controls">
          <button class="stpv-cbtn" data-action="expand" title="${captions.titleExpand}">${captions.btnExpand}</button>
          <button class="stpv-cbtn" data-action="contract" title="${captions.titleContract}">${captions.btnContract}</button>
          <div class="stpv-cdiv"></div>
          <button class="stpv-cbtn active" data-action="auto-rotate" title="${captions.titleAutoRotate}">&#10227;</button>
          <button class="stpv-cbtn" data-action="stop-rotate" title="${captions.titleStopRotate}">&#9632;</button>
          <button class="stpv-cbtn" data-action="free-rotate" title="${captions.titleFreeRotate}">&#9978;</button>
          <div class="stpv-cdiv"></div>
          <button class="stpv-cbtn" data-action="reset" title="${captions.titleReset}">&#8634;</button>
        </div>
        <div class="stpv-info">
          <div class="stpv-info-num"></div>
          <div class="stpv-info-name"></div>
          <div class="stpv-info-sub"></div>
          <div class="stpv-info-detail"></div>
          <div class="stpv-info-line"></div>
        </div>
      </div>
    `;
    injectStyles(container.querySelector('.stpv'));
  }

  // ─── Main Viewer Class ───
  class STPViewerInstance {
    constructor(container, config) {
      this.el = typeof container === 'string' ? document.querySelector(container) : container;
      this.config = config;
      this.src = config.src.replace(/\/?$/, '/');
      this.assemblies = config.assemblies || [];
      this.parts = [];
      this.asmData = [];
      this.activeAssembly = -1;
      this.explodeAmount = 0;
      this.targetExplode = 0;
      this.dimAmount = 0;
      this.targetDim = 0;
      this.explodeLevel = 0;
      this.manualMode = false;
      this.THREE = null;
    }

    async start() {
      buildUI(this.el, this.config);

      // Load Three.js from CDN
      const THREE = await this._loadThree();
      this.THREE = THREE;

      // Load addons
      const { OrbitControls } = await import(`${THREE_CDN}/examples/jsm/controls/OrbitControls.js`);
      const { STLLoader } = await import(`${THREE_CDN}/examples/jsm/loaders/STLLoader.js`);
      this.OrbitControls = OrbitControls;
      this.STLLoader = STLLoader;

      // Load config + manifest
      await this._loadData();

      // Setup scene
      this._setupScene();
      this._setupLights();
      this._setupControls();
      this._bindUI();

      // Load parts
      await this._loadParts();

      // Start render
      this._animate();

      // Hide loader
      setTimeout(() => {
        this.el.querySelector('.stpv-loader').classList.add('hidden');
      }, 500);
    }

    async _loadThree() {
      if (window.THREE) return window.THREE;
      const mod = await import(`${THREE_CDN}/build/three.module.js`);
      return mod;
    }

    async _loadData() {
      // Load manifest
      const mRes = await fetch(this.src + 'manifest.json');
      this.manifest = (await mRes.json()).filter(p => p.fileSize > 2000);

      // Load assemblies if not provided in config
      if (!this.assemblies.length) {
        try {
          const aRes = await fetch(this.src + 'assemblies.json');
          this.assemblies = await aRes.json();
        } catch (e) {
          // Try config.json
          try {
            const cRes = await fetch(this.src + 'config.json');
            const cfg = await cRes.json();
            this.assemblies = cfg.assemblies || [];
            if (cfg.productName) this.config.productName = cfg.productName;
          } catch (e2) { /* no assemblies */ }
        }
      }

      // Build left nav
      this._buildLeftNav();
    }

    _buildLeftNav() {
      const nav = this.el.querySelector('.stpv-leftnav');
      nav.innerHTML = '';
      this.assemblies.forEach((asm, i) => {
        const item = document.createElement('div');
        item.className = 'stpv-nav-item';
        item.style.color = asm.color;
        item.dataset.index = i;
        item.innerHTML = `<div class="stpv-nav-dot" style="background:${asm.color}"></div><div class="stpv-nav-label">${asm.name}</div>`;
        item.addEventListener('click', () => this._selectAssembly(i));
        nav.appendChild(item);
      });
    }

    _setupScene() {
      const T = this.THREE;
      const wrapper = this.el.querySelector('.stpv');
      const w = wrapper.clientWidth, h = wrapper.clientHeight;

      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x0a0e1a);

      this.camera = new T.PerspectiveCamera(35, w / h, 1, 15000);
      this.camera.position.set(3000, 1800, 3000);

      this.renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.toneMapping = T.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 2.2;

      // Insert canvas after loader
      const loader = wrapper.querySelector('.stpv-loader');
      wrapper.insertBefore(this.renderer.domElement, loader);

      // Ground
      const ground = new T.Mesh(
        new T.PlaneGeometry(12000, 12000),
        new T.MeshStandardMaterial({ color: 0x151a2a, metalness: 0.7, roughness: 0.3 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -500;
      ground.receiveShadow = true;
      this.scene.add(ground);

      // Spotlight for highlighting
      this.spot = new T.SpotLight(0xffffff, 0, 0, Math.PI / 5, 0.6, 1);
      this.spot.position.set(0, 3000, 0);
      this.scene.add(this.spot);
      this.scene.add(this.spot.target);

      // Resize observer
      const ro = new ResizeObserver(() => {
        const w2 = wrapper.clientWidth, h2 = wrapper.clientHeight;
        this.camera.aspect = w2 / h2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w2, h2);
      });
      ro.observe(wrapper);
    }

    _setupLights() {
      const T = this.THREE;
      this.scene.add(new T.AmbientLight(0x8899bb, 1.5));
      this.scene.add(new T.HemisphereLight(0xddeeff, 0x445566, 1.0));

      const key = new T.DirectionalLight(0xfff5e6, 3.5);
      key.position.set(2000, 3000, 1500);
      key.castShadow = true;
      this.scene.add(key);

      this.scene.add(Object.assign(new T.DirectionalLight(0xaaccff, 1.8), { position: new T.Vector3(-1500, 1000, -1000) }));
      this.scene.add(Object.assign(new T.DirectionalLight(0xffffff, 1.2), { position: new T.Vector3(0, 500, -2500) }));
      this.scene.add(Object.assign(new T.DirectionalLight(0x0055A4, 0.8), { position: new T.Vector3(-500, 1500, -2000) }));
      this.scene.add(Object.assign(new T.DirectionalLight(0xeeeeff, 0.5), { position: new T.Vector3(0, 4000, 0) }));
    }

    _setupControls() {
      this.controls = new this.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 0, 0);
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.4;
      this.controls.minDistance = 800;
      this.controls.maxDistance = 5500;
    }

    async _loadParts() {
      const T = this.THREE;
      const loader = new this.STLLoader();
      const fill = this.el.querySelector('.stpv-loader-fill');
      const text = this.el.querySelector('.stpv-loader-text');

      // Model center
      let cx = 0, cy = 0, cz = 0;
      for (const p of this.manifest) { cx += p.center[0]; cy += p.center[1]; cz += p.center[2]; }
      this.modelCenter = new T.Vector3(cx / this.manifest.length, cy / this.manifest.length, cz / this.manifest.length);

      // Assembly index per part
      const partAsm = new Array(this.manifest.length).fill(-1);
      for (let ai = 0; ai < this.assemblies.length; ai++) {
        const [s, e] = this.assemblies[ai].indices;
        for (let pi = s; pi < e; pi++) partAsm[pi] = ai;
      }

      // Per-assembly data
      this.asmData = this.assemblies.map(a => ({
        ...a, meshes: [], center: new T.Vector3(), colorObj: new T.Color(a.color),
      }));

      // Material presets per assembly key
      const matPresets = {};
      for (const asm of this.assemblies) {
        const c = new T.Color(asm.color);
        const hsl = {}; c.getHSL(hsl);
        matPresets[asm.key] = {
          color: new T.Color().setHSL(hsl.h, hsl.s * 0.4, 0.6),
          metalness: 0.45, roughness: 0.35,
        };
      }

      const total = this.manifest.length;
      let loaded = 0;

      const batchSize = 25;
      for (let i = 0; i < total; i += batchSize) {
        const batch = this.manifest.slice(i, i + batchSize);
        await Promise.all(batch.map((partInfo, bi) => new Promise(resolve => {
          const idx = i + bi;
          loader.load(this.src + 'parts/' + partInfo.file, geo => {
            geo.computeVertexNormals();

            const ai = partAsm[idx];
            const preset = ai >= 0 && this.assemblies[ai] ? matPresets[this.assemblies[ai].key] : null;
            const baseColor = preset ? preset.color.clone() : new T.Color(0xb0b8c4);
            const baseMetal = preset ? preset.metalness : 0.4;
            const baseRough = preset ? preset.roughness : 0.35;

            const mat = new T.MeshStandardMaterial({
              color: baseColor, metalness: baseMetal, roughness: baseRough, side: T.DoubleSide,
            });
            const mesh = new T.Mesh(geo, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const mc = this.modelCenter;
            const oc = new T.Vector3(partInfo.center[0] - mc.x, partInfo.center[2] - mc.z, -(partInfo.center[1] - mc.y));
            geo.translate(-mc.x, -mc.z, mc.y);

            const dir = oc.clone();
            if (dir.length() < 1) dir.set(0, 1, 0);
            dir.normalize();

            const vol = partInfo.bbox[0] * partInfo.bbox[1] * partInfo.bbox[2];
            let dist;
            if (vol > 50000000) dist = 250 + Math.random() * 120;
            else if (vol > 1000000) dist = 400 + Math.random() * 300;
            else dist = 600 + Math.random() * 500;

            mesh.userData = { idx, asmIdx: ai, explodeDir: dir, explodeDist: dist, origCenter: oc, baseColor, baseMetal, baseRough, _currentExplode: 0 };

            this.scene.add(mesh);
            this.parts.push(mesh);
            if (ai >= 0) this.asmData[ai].meshes.push(mesh);

            loaded++;
            fill.style.width = (loaded / total * 100) + '%';
            text.textContent = `${loaded} / ${total}`;
            resolve();
          }, undefined, () => { loaded++; resolve(); });
        })));
      }

      // Compute assembly centers
      for (const ad of this.asmData) {
        if (!ad.meshes.length) continue;
        const c = new T.Vector3();
        for (const m of ad.meshes) c.add(m.userData.origCenter);
        c.divideScalar(ad.meshes.length);
        ad.center.copy(c);
      }
    }

    _selectAssembly(i) {
      if (this.activeAssembly === i) {
        // Deselect
        this.activeAssembly = -1;
        this.targetDim = 0;
        this._hideInfo();
      } else {
        this.activeAssembly = i;
        this.targetExplode = 1;
        this.targetDim = 1;
        if (this.explodeLevel < 0.5) this.explodeLevel = 1;
        this.manualMode = true;
        this._showInfo(i);
      }
      this._updateNavActive();
    }

    _updateNavActive() {
      this.el.querySelectorAll('.stpv-nav-item').forEach((item, i) => {
        item.classList.toggle('active', i === this.activeAssembly);
      });
    }

    _showInfo(i) {
      const asm = this.assemblies[i];
      const info = this.el.querySelector('.stpv-info');
      info.querySelector('.stpv-info-num').textContent = `0${i + 1} / 0${this.assemblies.length}`;
      info.querySelector('.stpv-info-num').style.color = asm.color;
      info.querySelector('.stpv-info-name').textContent = asm.name;
      info.querySelector('.stpv-info-name').style.color = asm.color;
      info.querySelector('.stpv-info-sub').textContent = asm.subtitle || '';
      info.querySelector('.stpv-info-detail').textContent = asm.detail || '';
      info.querySelector('.stpv-info-line').style.background = asm.color;
      info.classList.add('visible');
    }

    _hideInfo() {
      this.el.querySelector('.stpv-info').classList.remove('visible');
    }

    _bindUI() {
      const self = this;

      // Top bar buttons
      this.el.querySelectorAll('.stpv-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          self.el.querySelectorAll('.stpv-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          if (action === 'overview') {
            self.manualMode = false;
            self.explodeLevel = 0;
            self.targetExplode = 0;
            self.targetDim = 0;
            self.activeAssembly = -1;
            self._hideInfo();
            self._updateNavActive();
          } else if (action === 'collapse') {
            self.manualMode = true;
            self.targetExplode = 0;
            self.explodeLevel = 0;
            self.targetDim = 0;
            self.activeAssembly = -1;
            self._hideInfo();
            self._updateNavActive();
          } else if (action === 'explode') {
            self.manualMode = true;
            self.targetExplode = 1;
            self.explodeLevel = 1;
            self.targetDim = 0;
            self.activeAssembly = -1;
            self._hideInfo();
            self._updateNavActive();
          }
        });
      });

      // Right controls
      this.el.querySelectorAll('.stpv-cbtn').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;

          if (action === 'expand') {
            self.explodeLevel = Math.min(3.0, self.explodeLevel + 0.25);
            self.manualMode = true;
            self.targetExplode = Math.min(self.explodeLevel, 1);
            self.targetDim = 0;
            self.activeAssembly = -1;
            self._hideInfo();
            self._updateNavActive();
          } else if (action === 'contract') {
            self.explodeLevel = Math.max(0, self.explodeLevel - 0.25);
            self.manualMode = true;
            self.targetExplode = Math.min(self.explodeLevel, 1);
            self.targetDim = 0;
            self.activeAssembly = -1;
            self._hideInfo();
            self._updateNavActive();
          } else if (action === 'auto-rotate') {
            self.controls.autoRotate = true;
            self.controls.autoRotateSpeed = 0.4;
            self._setRotateActive(btn);
          } else if (action === 'stop-rotate') {
            self.controls.autoRotate = false;
            self._setRotateActive(btn);
          } else if (action === 'free-rotate') {
            self.controls.autoRotate = false;
            self._setRotateActive(btn);
          } else if (action === 'reset') {
            self.camera.position.set(3000, 1800, 3000);
            self.controls.target.set(0, 0, 0);
            self.controls.autoRotate = true;
            self.controls.autoRotateSpeed = 0.4;
            self.manualMode = false;
            self.explodeLevel = 0;
            self.targetExplode = 0;
            self.targetDim = 0;
            self.activeAssembly = -1;
            self._hideInfo();
            self._updateNavActive();
            self._setRotateActive(self.el.querySelector('[data-action="auto-rotate"]'));
            self.el.querySelectorAll('.stpv-btn').forEach(b => b.classList.remove('active'));
            self.el.querySelector('[data-action="overview"]').classList.add('active');
          }
        });
      });
    }

    _setRotateActive(btn) {
      this.el.querySelectorAll('.stpv-cbtn[data-action*="rotate"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    _animate() {
      const T = this.THREE;
      const clock = new T.Clock();
      const lerp = (a, b, t) => a + (b - a) * Math.min(1, t);

      const tick = () => {
        requestAnimationFrame(tick);
        const delta = Math.min(clock.getDelta(), 0.05);

        // Smooth transitions
        this.explodeAmount = lerp(this.explodeAmount, this.targetExplode, delta * 3);
        this.dimAmount = lerp(this.dimAmount, this.targetDim, delta * 4);

        const scale = this.manualMode ? Math.max(this.explodeLevel, 1) : 1;
        const hlColor = this.activeAssembly >= 0 ? this.asmData[this.activeAssembly].colorObj : null;

        for (const mesh of this.parts) {
          const ud = mesh.userData;
          const isHl = (ud.asmIdx === this.activeAssembly);

          // Per-part explode: highlighted collapses, others stay
          let partExplode;
          if (this.activeAssembly >= 0 && this.dimAmount > 0.1) {
            partExplode = isHl ? this.explodeAmount * (1 - this.dimAmount) : this.explodeAmount;
          } else {
            partExplode = this.explodeAmount;
          }
          ud._currentExplode = lerp(ud._currentExplode, partExplode, delta * 4);

          const ed = ud.explodeDist * ud._currentExplode * scale;
          mesh.position.set(ud.explodeDir.x * ed, ud.explodeDir.y * ed, ud.explodeDir.z * ed);

          // Color
          const mat = mesh.material;
          if (this.dimAmount > 0.05 && this.activeAssembly >= 0) {
            if (isHl) {
              mat.color.lerp(hlColor, delta * 6);
              mat.emissive.copy(hlColor).multiplyScalar(0.1 * this.dimAmount);
              mat.metalness = lerp(mat.metalness, Math.min(ud.baseMetal + 0.15, 0.8), delta * 4);
              mat.roughness = lerp(mat.roughness, Math.max(ud.baseRough - 0.1, 0.1), delta * 4);
              mat.transparent = false; mat.opacity = 1;
            } else {
              mat.color.lerp(new T.Color(0x181820), delta * 5);
              mat.emissive.setHex(0x000000);
              mat.transparent = true;
              mat.opacity = lerp(mat.opacity, 1 - this.dimAmount * 0.7, delta * 4);
            }
          } else {
            mat.color.lerp(ud.baseColor, delta * 3);
            mat.emissive.lerp(new T.Color(0), delta * 5);
            mat.metalness = lerp(mat.metalness, ud.baseMetal, delta * 3);
            mat.roughness = lerp(mat.roughness, ud.baseRough, delta * 3);
            mat.transparent = false; mat.opacity = 1;
          }
        }

        // Spotlight
        if (this.activeAssembly >= 0 && this.dimAmount > 0.3) {
          const ac = this.asmData[this.activeAssembly].center;
          this.spot.intensity = lerp(this.spot.intensity, 4 * this.dimAmount, delta * 3);
          this.spot.position.lerp(new T.Vector3(ac.x * 0.5, 3000, ac.z * 0.5), delta * 2);
          this.spot.target.position.lerp(new T.Vector3(ac.x * 0.5, ac.y * 0.5, ac.z * 0.5), delta * 2);
        } else {
          this.spot.intensity = lerp(this.spot.intensity, 0, delta * 3);
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      };

      tick();
    }
  }

  // ─── Public API ───
  window.STPViewer = {
    init: async function (opts) {
      const container = typeof opts.container === 'string' ? document.querySelector(opts.container) : opts.container;
      if (!container) { console.error('STPViewer: container not found'); return; }

      const viewer = new STPViewerInstance(container, {
        src: opts.src,
        brand: opts.brand || '',
        productName: opts.productName || '',
        assemblies: opts.assemblies || [],
        captions: opts.captions || {},
      });
      await viewer.start();
      return viewer;
    },

    // Auto-init from data attributes
    autoInit: function () {
      document.querySelectorAll('[data-stp-viewer]').forEach(async el => {
        const src = el.dataset.stpViewer || el.dataset.src;
        if (!src) return;
        const viewer = new STPViewerInstance(el, {
          src,
          brand: el.dataset.brand || '',
          productName: el.dataset.productName || '',
          assemblies: [],
          captions: {
            brand: el.dataset.brand || '',
            productName: el.dataset.productName || '',
            loaderTitle: el.dataset.loaderTitle || '',
            loaderText: el.dataset.loaderText || undefined,
          },
        });
        await viewer.start();
      });
    }
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => STPViewer.autoInit());
  } else {
    STPViewer.autoInit();
  }
})();
