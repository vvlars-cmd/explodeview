import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

// ─────────────────────────────────────────────
//  CONFIGURATION — customize these values
// ─────────────────────────────────────────────
const CONFIG = window.EXPLODEVIEW_CONFIG || {
  brand: 'cycleWASH',           // Brand name (first part of logo)
  productName: 'Station Basic', // Product name (second part, shown bold)
  tagline: 'Engineered in Germany. 399 precision components. One seamless cleaning experience.',
  badge: 'Professional Bike Washing',
};

// Apply config to ALL text elements immediately
(function applyConfig() {
  // Top logo — show brand + product, truncate on mobile via CSS
  const logo = document.getElementById('top-logo');
  if (logo) {
    logo.innerHTML = `<span class="logo-brand">${CONFIG.brand}</span> <span class="logo-product">${CONFIG.productName}</span>`;
  }

  // Loader
  const loaderTitle = document.getElementById('loader-title');
  if (loaderTitle) loaderTitle.innerHTML = `${CONFIG.brand}<span>${CONFIG.productName}</span>`;
  const loaderProduct = document.querySelector('.loader-product');
  if (loaderProduct) loaderProduct.textContent = CONFIG.productName.toUpperCase();

  // Hero
  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge) heroBadge.textContent = CONFIG.badge;
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) heroTitle.innerHTML = `${CONFIG.brand}<span>${CONFIG.productName}</span>`;
  const heroModel = document.querySelector('.model-name');
  if (heroModel) heroModel.textContent = CONFIG.productName.toUpperCase();
  const heroTagline = document.querySelector('.tagline');
  if (heroTagline) heroTagline.textContent = CONFIG.tagline;


  // Finale
  const finaleTitle = document.querySelector('.finale h2');
  if (finaleTitle) finaleTitle.innerHTML = `${CONFIG.brand} <span>${CONFIG.productName}</span>`;
})();

// ─────────────────────────────────────────────
//  ASSEMBLY DEFINITIONS
// ─────────────────────────────────────────────
const ASSEMBLIES = [
  {
    key: "BG_Metall-Teile",
    name: "METAL FRAME",
    subtitle: "Brushed Stainless Steel",
    detail: "The backbone of every cycleWASH. Laser-cut and welded from marine-grade stainless steel for decades of outdoor durability.",
    color: "#D0D4DA",
    indices: [0, 220],
  },
  {
    key: "BG_Kunststoff",
    name: "PROTECTIVE COVERS",
    subtitle: "Matte Black ABS Polymer",
    detail: "Custom-molded side panels and ramps in impact-resistant matte black ABS. Protects internals while guiding bicycles through the wash.",
    color: "#2A2A30",
    indices: [220, 225],
  },
  {
    key: "Stellfuss",
    name: "MOUNTING SYSTEM",
    subtitle: "Stainless Steel Leveling Feet",
    detail: "Precision-adjustable stainless steel feet ensure perfect leveling on any surface.",
    color: "#B8BCC4",
    indices: [225, 237],
  },
  {
    key: "BG_Achse",
    name: "WHEEL AXLE ASSEMBLY",
    subtitle: "Grey Rubber & Steel",
    detail: "Sealed roller bearings with grey rubber guide wheels supporting bikes of all sizes and weights.",
    color: "#6E6E72",
    indices: [237, 278],
  },
  {
    key: "Raddreheinheit",
    name: "WHEEL TURNING UNIT",
    subtitle: "Motorized Drive System",
    detail: "The heart of cycleWASH. Interroll motorized rollers, drive chains, and precision carriers rotate each wheel through the cleaning zone.",
    color: "#0055A4",
    indices: [278, 392],
  },
  {
    key: "Oelabscheider",
    name: "OIL SEPARATOR",
    subtitle: "Metallic Blue Coated Steel",
    detail: "Integrated oil-water separator with metallic blue powder-coated collection pan, ribs, and drainage system.",
    color: "#2277CC",
    indices: [392, 399],
  },
];

// ─────────────────────────────────────────────
//  GENERATE ASSEMBLY HTML SECTIONS + LEFT NAV
// ─────────────────────────────────────────────
const sectionsContainer = document.getElementById('assembly-sections');
const navItems = document.getElementById('nav-items');

ASSEMBLIES.forEach((asm, i) => {
  // Assembly scroll section
  const section = document.createElement('section');
  section.className = 'assembly-section';
  section.dataset.assembly = i;
  section.innerHTML = `
    <div class="assembly-text" id="asm-text-${i}">
      <div class="assembly-number" style="color:${asm.color}">0${i + 1} / 0${ASSEMBLIES.length}</div>
      <div class="assembly-name" style="color:${asm.color}">${asm.name}</div>
      <div class="assembly-subtitle">${asm.subtitle}</div>
      <div class="assembly-detail">${asm.detail}</div>
      <div class="assembly-line" style="background:${asm.color}"></div>
    </div>
  `;
  sectionsContainer.appendChild(section);

  // Left nav item with assembly color
  const navItem = document.createElement('div');
  navItem.className = 'nav-item';
  navItem.dataset.navIndex = i;
  navItem.style.color = asm.color;
  navItem.innerHTML = `
    <div class="nav-dot" style="background:${asm.color}"></div>
    <div class="nav-label">${asm.name}</div>
  `;
  navItem.addEventListener('click', () => {
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  navItems.appendChild(navItem);
});

// Left nav visibility & active state
const leftNav = document.getElementById('left-nav');

function updateLeftNav() {
  const asmSections = document.querySelectorAll('.assembly-section');
  const vh = window.innerHeight;
  let anyActive = false;

  asmSections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    const viewProgress = 1 - (rect.top / vh);
    const navItem = document.querySelector(`.nav-item[data-nav-index="${i}"]`);
    if (!navItem) return;

    navItem.classList.remove('active', 'past');

    if (viewProgress > 0.3 && viewProgress < 2.5) {
      navItem.classList.add('active');
      // Update nav line progress
      const lineProgress = ((i + 0.5) / ASSEMBLIES.length) * 100;
      document.querySelector('.nav-line').style.setProperty('--progress', lineProgress + '%');
      anyActive = true;
    } else if (viewProgress >= 2.5) {
      navItem.classList.add('past');
    }
  });

  // Left nav always visible — no toggle needed

  // Update the progress line
  const navLine = document.querySelector('.nav-line::after');
}

window.addEventListener('scroll', updateLeftNav, { passive: true });

// Mobile: build top assembly nav + handle selection with info display
const topAsms = document.getElementById('top-assemblies');
const mobAsmInfo = document.getElementById('mob-asm-info');
const mobAsmName = document.getElementById('mob-asm-name');
const mobAsmSub = document.getElementById('mob-asm-sub');

if (topAsms) {
  ASSEMBLIES.forEach((asm, i) => {
    const link = document.createElement('a');
    link.className = 'top-asm';
    link.textContent = asm.name;
    link.style.color = asm.color;
    link.dataset.asmIndex = i;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Toggle selection
      const wasActive = link.classList.contains('active');
      topAsms.querySelectorAll('.top-asm').forEach(a => a.classList.remove('active'));

      if (wasActive) {
        // Deselect
        mobAsmInfo?.classList.remove('show');
      } else {
        // Select this assembly
        link.classList.add('active');
        if (mobAsmName) { mobAsmName.textContent = asm.name; mobAsmName.style.color = asm.color; }
        if (mobAsmSub) mobAsmSub.textContent = asm.subtitle;
        mobAsmInfo?.classList.add('show');
      }
    });
    topAsms.appendChild(link);
  });
}

// ─────────────────────────────────────────────
//  THREE.JS SCENE
// ─────────────────────────────────────────────
const container = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e1a);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 15000);
camera.position.set(3000, 1800, 3000);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.2;
container.appendChild(renderer.domElement);

// ─── Lighting ───
const ambientLight = new THREE.AmbientLight(0x8899bb, 1.5);
scene.add(ambientLight);
scene.add(new THREE.HemisphereLight(0xddeeff, 0x445566, 1.0));

const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.5);
keyLight.position.set(2000, 3000, 1500);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
const sd = 2500;
keyLight.shadow.camera.left = -sd; keyLight.shadow.camera.right = sd;
keyLight.shadow.camera.top = sd; keyLight.shadow.camera.bottom = -sd;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xaaccff, 1.8);
fillLight.position.set(-1500, 1000, -1000);
scene.add(fillLight);

const backLight = new THREE.DirectionalLight(0xffffff, 1.2);
backLight.position.set(0, 500, -2500);
scene.add(backLight);

const rimLight = new THREE.DirectionalLight(0x0055A4, 0.8);
rimLight.position.set(-500, 1500, -2000);
scene.add(rimLight);

const topLight = new THREE.DirectionalLight(0xeeeeff, 0.5);
topLight.position.set(0, 4000, 0);
scene.add(topLight);

// Spotlight for assembly focus
const spot = new THREE.SpotLight(0xffffff, 0, 0, Math.PI / 5, 0.6, 1);
spot.position.set(0, 3000, 0);
scene.add(spot);
scene.add(spot.target);

// Ground
const groundMat = new THREE.MeshStandardMaterial({ color: 0x151a2a, metalness: 0.7, roughness: 0.3 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -500;
ground.receiveShadow = true;
scene.add(ground);

// Particles
const pCount = 200;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  pPos[i*3] = (Math.random()-0.5)*8000;
  pPos[i*3+1] = Math.random()*3000-500;
  pPos[i*3+2] = (Math.random()-0.5)*8000;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({
  color: 0x0055A4, size: 2.5, transparent: true, opacity: 0.3,
  blending: THREE.AdditiveBlending, depthWrite: false,
});
scene.add(new THREE.Points(pGeo, pMat));

// Controls — always enabled for user interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.enabled = true;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.4;
controls.minDistance = 800;
controls.maxDistance = 5500;

// Lock camera when user starts dragging so auto-updates don't fight
renderer.domElement.addEventListener('pointerdown', () => { cameraLocked = true; });
renderer.domElement.addEventListener('pointerup', () => {
  // Keep locked unless auto-rotate is on
  if (controls.autoRotate) cameraLocked = false;
});

// ─────────────────────────────────────────────
//  AUDIO ENGINE
// ─────────────────────────────────────────────
class Audio {
  constructor() { this.ctx = null; this.muted = false; }
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  _gain(vol) {
    if (!this.ctx || this.muted) return null;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    g.connect(this.ctx.destination);
    return g;
  }
  whoosh() {
    const g = this._gain(0.1); if (!g) return;
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const f = this.ctx.createBiquadFilter();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(250, now);
    o.frequency.exponentialRampToValueAtTime(50, now + 0.6);
    f.type = 'lowpass'; f.frequency.setValueAtTime(2000, now);
    f.frequency.exponentialRampToValueAtTime(150, now + 0.6);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    o.connect(f).connect(g);
    o.start(now); o.stop(now + 0.7);
  }
  impact() {
    const g = this._gain(0.15); if (!g) return;
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(80, now);
    o.frequency.exponentialRampToValueAtTime(25, now + 0.3);
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    o.connect(g); o.start(now); o.stop(now + 0.35);
  }
  shimmer(baseFreq = 700) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.02, now + i*0.04);
      g.gain.linearRampToValueAtTime(0.04, now + 0.15 + i*0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      g.connect(this.ctx.destination);
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(baseFreq + i*180, now);
      o.frequency.linearRampToValueAtTime(baseFreq*1.4 + i*250, now + 0.7);
      o.connect(g); o.start(now + i*0.04); o.stop(now + 0.8);
    }
  }
  sweep(up = true) {
    const g = this._gain(0.06); if (!g) return;
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    if (up) { o.frequency.setValueAtTime(80, now); o.frequency.exponentialRampToValueAtTime(600, now + 0.35); }
    else { o.frequency.setValueAtTime(600, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.35); }
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    o.connect(g); o.start(now); o.stop(now + 0.45);
  }
  drone() {
    if (!this.ctx || this._droneStarted) return;
    this._droneStarted = true;
    const now = this.ctx.currentTime;
    [55, 82.5, 110].forEach(freq => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const f = this.ctx.createBiquadFilter();
      o.type = 'sine'; o.frequency.value = freq;
      f.type = 'lowpass'; f.frequency.value = 300;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.02, now + 3);
      o.connect(f).connect(g).connect(this.ctx.destination);
      o.start(now);
    });
  }
}
const audio = new Audio();

// Sound button
const soundBtn = document.getElementById('sound-btn');
soundBtn.addEventListener('click', () => {
  audio.init(); audio.drone();
  audio.muted = !audio.muted;
  soundBtn.classList.toggle('on', !audio.muted);
  soundBtn.textContent = audio.muted ? '🔇' : '♪';
});

// Init audio on any click
document.addEventListener('click', () => {
  audio.init(); audio.drone();
  if (!audio.muted) { soundBtn.classList.add('on'); soundBtn.textContent = '♪'; }
}, { once: true });

// ─────────────────────────────────────────────
//  LOAD MODEL
// ─────────────────────────────────────────────
const stlLoader = new STLLoader();
const allParts = [];
let manifest = [];
let modelCenter = new THREE.Vector3();
let loadedCount = 0;
let totalParts = 0;

// Per-assembly data
const asmData = ASSEMBLIES.map(a => ({
  ...a,
  meshes: [],
  center: new THREE.Vector3(),
  colorObj: new THREE.Color(a.color),
}));

async function loadModel() {
  const [mRes, amRes] = await Promise.all([
    fetch('./manifest.json'),
    fetch('./assemblies.json'),
  ]);
  manifest = await mRes.json();
  manifest = manifest.filter(p => p.fileSize > 3000);
  totalParts = manifest.length;

  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  // Model center
  let cx=0, cy=0, cz=0;
  for (const p of manifest) { cx += p.center[0]; cy += p.center[1]; cz += p.center[2]; }
  modelCenter.set(cx/manifest.length, cy/manifest.length, cz/manifest.length);

  // Assign assembly index to each part
  const partAsmIndex = new Array(manifest.length).fill(-1);
  for (let ai = 0; ai < ASSEMBLIES.length; ai++) {
    const [start, end] = ASSEMBLIES[ai].indices;
    for (let pi = start; pi < end; pi++) partAsmIndex[pi] = ai;
  }

  // Load all parts from merged binary chunks (3 requests instead of 399)
  progressText.textContent = 'Downloading model...';
  const idxResponse = await fetch('./model_index.json');
  const modelIndex = await idxResponse.json();

  // Download all chunks and concatenate
  const chunkBuffers = [];
  let downloadedBytes = 0;
  for (const chunk of modelIndex.chunks) {
    const res = await fetch('./' + chunk.file);
    const buf = await res.arrayBuffer();
    chunkBuffers.push(new Uint8Array(buf));
    downloadedBytes += buf.byteLength;
    progressText.textContent = `Downloading: ${(downloadedBytes / 1024 / 1024).toFixed(0)} MB`;
  }

  // Merge chunks into single buffer
  const binBuffer = new ArrayBuffer(modelIndex.totalSize);
  const merged = new Uint8Array(binBuffer);
  let writeOffset = 0;
  for (const chunk of chunkBuffers) {
    merged.set(chunk, writeOffset);
    writeOffset += chunk.length;
  }
  const binView = new DataView(binBuffer);

  progressText.textContent = 'Processing parts...';
  const partCount = binView.getUint32(0, true);
  const headerSize = 4;
  const indexSize = partCount * 8;

  const stlParser = new STLLoader();

  for (let idx = 0; idx < partCount && idx < manifest.length; idx++) {
    const offset = binView.getUint32(headerSize + idx * 8, true);
    const length = binView.getUint32(headerSize + idx * 8 + 4, true);
    if (length < 100) continue; // skip degenerate

    const stlBytes = new Uint8Array(binBuffer, offset, length);
    const geo = stlParser.parse(stlBytes.buffer.slice(offset, offset + length));
    geo.computeVertexNormals();

    const partInfo = manifest[idx];
    const ai = partAsmIndex[idx];
    let baseColor, baseMetal, baseRough;

    const asmKey = ai >= 0 ? ASSEMBLIES[ai].key : '';
    switch (asmKey) {
      case 'BG_Metall-Teile':
      case 'Stellfuss':
        baseColor = new THREE.Color(0xc8ccd2); baseMetal = 0.75; baseRough = 0.25; break;
      case 'BG_Kunststoff':
        baseColor = new THREE.Color(0x1a1a1e); baseMetal = 0.0; baseRough = 0.85; break;
      case 'BG_Achse':
        baseColor = new THREE.Color(0x555558); baseMetal = 0.1; baseRough = 0.7; break;
      case 'Raddreheinheit':
        baseColor = new THREE.Color(0xb0b5bc); baseMetal = 0.6; baseRough = 0.3; break;
      case 'Oelabscheider':
        baseColor = new THREE.Color(0x1a5fa0); baseMetal = 0.65; baseRough = 0.2; break;
      default:
        baseColor = new THREE.Color(0xb0b8c4); baseMetal = 0.4; baseRough = 0.35;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: baseColor, metalness: baseMetal, roughness: baseRough, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true; mesh.receiveShadow = true;

    const oc = new THREE.Vector3(
      partInfo.center[0] - modelCenter.x,
      partInfo.center[2] - modelCenter.z,
      -(partInfo.center[1] - modelCenter.y)
    );
    geo.translate(-modelCenter.x, -modelCenter.z, modelCenter.y);

    const dir = oc.clone();
    if (dir.length() < 1) dir.set(0, 1, 0);
    dir.normalize();

    const vol = partInfo.bbox[0] * partInfo.bbox[1] * partInfo.bbox[2];
    let dist;
    if (vol > 50000000) dist = 250 + Math.random() * 120;
    else if (vol > 1000000) dist = 400 + Math.random() * 300;
    else dist = 600 + Math.random() * 500;

    mesh.userData = {
      idx, asmIdx: partAsmIndex[idx],
      explodeDir: dir, explodeDist: dist,
      origCenter: oc, baseColor: baseColor.clone(),
      baseMetal, baseRough,
    };

    scene.add(mesh);
    allParts.push(mesh);

    if (ai >= 0) asmData[ai].meshes.push(mesh);

    loadedCount++;
    if (loadedCount % 20 === 0 || loadedCount === totalParts) {
      progressFill.style.width = (loadedCount / totalParts * 100) + '%';
      progressText.textContent = `${loadedCount} / ${totalParts}`;
    }
  }

  // Compute assembly centers
  for (const ad of asmData) {
    if (!ad.meshes.length) continue;
    const c = new THREE.Vector3();
    for (const m of ad.meshes) c.add(m.userData.origCenter);
    c.divideScalar(ad.meshes.length);
    ad.center.copy(c);
  }

  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 500);
}

// ─────────────────────────────────────────────
//  SCROLL-DRIVEN ANIMATION STATE
// ─────────────────────────────────────────────
let explodeAmount = 0;
let targetExplode = 0;
let dimAmount = 0;
let targetDim = 0;
let activeAssembly = -1;
let highlightColor = new THREE.Color(0x0055A4);
let camTargetPos = new THREE.Vector3(3000, 1800, 3000);
let camTargetLook = new THREE.Vector3(0, 0, 0);
let lastActiveAssembly = -1;
let cameraLocked = false; // when true, camera position is not auto-updated

function updateScrollState() {
  // Skip scroll-driven updates when user clicked Collapse/Explode
  if (manualMode) {
    const t = Date.now() * 0.00015;
    camTargetPos.set(Math.cos(t) * 2800, 1400, Math.sin(t) * 2800);
    camTargetLook.set(0, 0, 0);
    return;
  }

  const scrollY = window.scrollY;
  const vh = window.innerHeight;

  // Get scroll positions of each assembly section
  const asmSections = document.querySelectorAll('.assembly-section');
  const explodeSection = document.querySelector('[data-phase="explode"]');
  const reassembleSection = document.querySelector('[data-phase="reassemble"]');

  // Phase 1: Hero -> Explode
  const explodeStart = explodeSection ? explodeSection.offsetTop : vh;
  const explodeEnd = explodeStart + vh;
  if (scrollY < explodeEnd) {
    const progress = Math.max(0, Math.min(1, (scrollY - explodeStart) / vh));
    targetExplode = progress;
    targetDim = 0;
    activeAssembly = -1;

    // Camera: orbit slowly
    const t = Date.now() * 0.0002;
    camTargetPos.set(
      Math.cos(t) * (3000 + progress * 500),
      1600 + progress * 400,
      Math.sin(t) * (3000 + progress * 500)
    );
    camTargetLook.set(0, 0, 0);

    if (progress > 0.3 && progress < 0.35 && targetExplode > 0.2) {
      audio.whoosh();
    }
  }

  // Phase 2: Assembly showcases
  asmSections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionMid = sectionTop + sectionHeight / 2;

    // Is this section in view?
    const viewProgress = 1 - (rect.top / vh);
    if (viewProgress > 0.3 && viewProgress < 2.5) {
      targetExplode = 1;
      targetDim = Math.min(1, (viewProgress - 0.3) * 2);
      activeAssembly = i;
      highlightColor.copy(asmData[i].colorObj);

      // Camera focuses on assembly — offset right so model is on right half of screen
      const ac = asmData[i].center;
      const t = Date.now() * 0.00015;
      const camDist = 2400;
      // Shift camera look-at to the right (+x) so 3D model renders on right side
      const rightOffset = 400;
      camTargetPos.set(
        ac.x * 0.3 + rightOffset + Math.cos(t + i * 0.7) * camDist,
        ac.y * 0.3 + 1200 + Math.sin(t * 0.7) * 150,
        ac.z * 0.3 + Math.sin(t + i * 0.7) * camDist
      );
      camTargetLook.set(ac.x * 0.4 + rightOffset * 0.3, ac.y * 0.4, ac.z * 0.4);

      // Show text
      const textEl = document.getElementById(`asm-text-${i}`);
      if (textEl) textEl.classList.add('visible');

      // Sound on assembly change
      if (lastActiveAssembly !== i) {
        lastActiveAssembly = i;
        audio.shimmer(500 + i * 100);
        audio.sweep(true);
      }
    } else {
      const textEl = document.getElementById(`asm-text-${i}`);
      if (textEl) textEl.classList.remove('visible');
    }
  });

  // Phase 3: Reassemble
  if (reassembleSection) {
    const rect = reassembleSection.getBoundingClientRect();
    if (rect.top < vh && rect.bottom > 0) {
      const progress = 1 - (rect.top / vh);
      targetExplode = Math.max(0, 1 - progress);
      targetDim = Math.max(0, 1 - progress * 1.5);
      activeAssembly = -1;

      const t = Date.now() * 0.0002;
      camTargetPos.set(
        Math.cos(t) * (2800 - progress * 500),
        1400 - progress * 200,
        Math.sin(t) * (2800 - progress * 500)
      );
      camTargetLook.set(0, 0, 0);

      if (progress > 0.3 && progress < 0.35) {
        audio.impact();
      }
    }
  }

  // Phase 4: Finale
  const finale = document.querySelector('[data-phase="finale"]');
  if (finale) {
    const rect = finale.getBoundingClientRect();
    if (rect.top < vh && rect.bottom > 0) {
      targetExplode = 0;
      targetDim = 0;
      activeAssembly = -1;
      const t = Date.now() * 0.00012;
      camTargetPos.set(Math.cos(t)*2600, 1100, Math.sin(t)*2600);
      camTargetLook.set(0, 0, 0);
    }
  }
}

// Explosion lines removed for cleaner look

// ─────────────────────────────────────────────
//  RENDER LOOP
// ─────────────────────────────────────────────
const clock = new THREE.Clock();

function lerp(a, b, t) { return a + (b - a) * Math.min(1, t); }

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  updateScrollState();

  // Smooth transitions
  explodeAmount = lerp(explodeAmount, targetExplode, delta * 3);
  dimAmount = lerp(dimAmount, targetDim, delta * 4);

  // Update all parts
  for (const mesh of allParts) {
    const ud = mesh.userData;
    const isHighlighted = (ud.asmIdx === activeAssembly);

    // Position: highlighted assembly collapses together, others stay exploded
    let partExplode;
    if (activeAssembly >= 0 && dimAmount > 0.1) {
      if (isHighlighted) {
        // Collapse this assembly: lerp toward 0 explosion
        partExplode = explodeAmount * (1 - dimAmount);
      } else {
        // Keep others fully exploded
        partExplode = explodeAmount;
      }
    } else {
      partExplode = explodeAmount;
    }

    // Smooth per-part explosion (stored for interpolation)
    if (ud._currentExplode === undefined) ud._currentExplode = 0;
    ud._currentExplode = lerp(ud._currentExplode, partExplode, delta * 4);

    const scale = manualMode ? Math.max(explodeLevel, 1) : 1;
    const ed = ud.explodeDist * ud._currentExplode * scale;
    mesh.position.x = ud.explodeDir.x * ed;
    mesh.position.y = ud.explodeDir.y * ed;
    mesh.position.z = ud.explodeDir.z * ed;

    // Store final position for explosion lines
    ud._finalPos = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };

    // Color
    const mat = mesh.material;
    if (dimAmount > 0.05 && activeAssembly >= 0) {
      if (isHighlighted) {
        // Use base color for realistic materials, highlight color for others
        const asmKey = ASSEMBLIES[activeAssembly]?.key;
        let hlColor;
        if (asmKey === 'BG_Kunststoff') {
          // Keep black plastic look, just brighten slightly
          hlColor = new THREE.Color(0x2a2a32);
        } else {
          hlColor = highlightColor;
        }
        mat.color.lerp(hlColor, delta * 6);
        mat.emissive.copy(hlColor).multiplyScalar(0.1 * dimAmount);
        mat.metalness = lerp(mat.metalness, Math.min(ud.baseMetal + 0.15, 0.8), delta * 4);
        mat.roughness = lerp(mat.roughness, Math.max(ud.baseRough - 0.1, 0.1), delta * 4);
        mat.transparent = false;
        mat.opacity = 1;
      } else {
        const dimCol = new THREE.Color(0x181820);
        mat.color.lerp(dimCol, delta * 5);
        mat.emissive.setHex(0x000000);
        mat.metalness = lerp(mat.metalness, 0.1, delta * 3);
        mat.roughness = lerp(mat.roughness, 0.8, delta * 3);
        mat.transparent = true;
        mat.opacity = lerp(mat.opacity, 1 - dimAmount * 0.7, delta * 4);
      }
    } else {
      mat.color.lerp(ud.baseColor, delta * 3);
      mat.emissive.lerp(new THREE.Color(0x000000), delta * 5);
      mat.metalness = lerp(mat.metalness, ud.baseMetal, delta * 3);
      mat.roughness = lerp(mat.roughness, ud.baseRough, delta * 3);
      mat.transparent = false;
      mat.opacity = 1;
    }
  }

  // Spotlight tracks active assembly
  if (activeAssembly >= 0 && dimAmount > 0.3) {
    const ac = asmData[activeAssembly].center;
    spot.intensity = lerp(spot.intensity, 4 * dimAmount, delta * 3);
    spot.position.lerp(new THREE.Vector3(ac.x * 0.5, 3000, ac.z * 0.5), delta * 2);
    spot.target.position.lerp(new THREE.Vector3(ac.x * 0.5, ac.y * 0.5, ac.z * 0.5), delta * 2);

    // Stop rotation on assembly select (unless user forced auto-rotate)
    if (!window._userForcedRotate) controls.autoRotate = false;
    if (!window._isoMovedFor || window._isoMovedFor !== activeAssembly) {
      window._isoMovedFor = activeAssembly;
      window._isoFrames = 0;
    }
    // Lerp to isometric for first 60 frames (~1 sec), then let user rotate freely
    if (window._isoFrames < 60 && !cameraLocked) {
      window._isoFrames++;
      const ac2 = asmData[activeAssembly].center;
      const isoDist = 2500;
      const isoPos = new THREE.Vector3(
        ac2.x * 0.3 + isoDist * 0.707,
        ac2.y * 0.3 + isoDist * 0.577,
        ac2.z * 0.3 + isoDist * 0.707
      );
      camera.position.lerp(isoPos, delta * 3);
      controls.target.lerp(new THREE.Vector3(ac2.x * 0.3, ac2.y * 0.3, ac2.z * 0.3), delta * 3);
    }
  } else {
    spot.intensity = lerp(spot.intensity, 0, delta * 3);
  }

  // Camera smooth follow — only when not user-controlled
  if (!cameraLocked && controls.autoRotate) {
    camera.position.lerp(camTargetPos, delta * 1.5);
    controls.target.lerp(camTargetLook, delta * 1.5);
  }

  // Rim light subtle animation
  rimLight.intensity = 0.6 + Math.sin(elapsed * 0.5) * 0.2;

  // Particles drift
  const pp = pGeo.attributes.position.array;
  for (let i = 0; i < pCount; i++) {
    pp[i*3+1] += delta * 6;
    if (pp[i*3+1] > 3000) pp[i*3+1] = -500;
  }
  pGeo.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
}

// ─── Resize ───
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Scroll listener (throttled) ───
let scrollTick = false;
window.addEventListener('scroll', () => {
  if (!scrollTick) {
    requestAnimationFrame(() => { scrollTick = false; });
    scrollTick = true;
  }
});

// ─── 3D View Controls ───
// + explodes more, - collapses back. Works as a direct explosion level control.
let explodeLevel = 0; // 0 = collapsed, 1 = normal explode, up to 3 = max

document.getElementById('btn-zoom-in').addEventListener('click', () => {
  explodeLevel = Math.min(3.0, explodeLevel + 0.25);
  manualMode = true;
  targetExplode = Math.min(explodeLevel, 1);
  targetDim = 0;
  activeAssembly = -1;
  if (explodeLevel > 0) setTopLinkActive('btn-explode');
});
document.getElementById('btn-zoom-out').addEventListener('click', () => {
  explodeLevel = Math.max(0, explodeLevel - 0.25);
  manualMode = true;
  targetExplode = Math.min(explodeLevel, 1);
  targetDim = 0;
  activeAssembly = -1;
  if (explodeLevel <= 0) setTopLinkActive('btn-collapse');
});

function setRotateActive(id) {
  ['btn-auto-rotate', 'btn-stop-rotate', 'btn-free-rotate'].forEach(b =>
    document.getElementById(b)?.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

function restoreScrollLayer() {
  document.getElementById('three-canvas').style.zIndex = '1';
  document.getElementById('scroll-driver').style.pointerEvents = '';
}

document.getElementById('btn-auto-rotate').addEventListener('click', () => {
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;
  window._userForcedRotate = true;
  cameraLocked = false;
  setRotateActive('btn-auto-rotate');
  restoreScrollLayer();
});
document.getElementById('btn-stop-rotate').addEventListener('click', () => {
  controls.autoRotate = false;
  window._userForcedRotate = false;
  cameraLocked = true;
  setRotateActive('btn-stop-rotate');
  restoreScrollLayer();
});
document.getElementById('btn-free-rotate').addEventListener('click', () => {
  controls.autoRotate = false;
  window._userForcedRotate = false;
  setRotateActive('btn-free-rotate');
  // Bring canvas to front so user can drag-rotate freely
  document.getElementById('three-canvas').style.zIndex = '10';
  document.getElementById('scroll-driver').style.pointerEvents = 'none';
});
document.getElementById('btn-reset-view').addEventListener('click', () => {
  camera.position.set(3000, 1800, 3000);
  controls.target.set(0, 0, 0);
  camTargetPos.set(3000, 1800, 3000);
  camTargetLook.set(0, 0, 0);
  controls.autoRotate = false;
  cameraLocked = false;
  window._userForcedRotate = false;
  window._isoMovedFor = null;
  manualMode = false;
  explodeLevel = 0;
  targetExplode = 0;
  targetDim = 0;
  activeAssembly = -1;
  hideOverview();
  setRotateActive('btn-stop-rotate');
  setTopLinkActive('btn-overview');
  restoreScrollLayer();
});

// ─── Top menu: Collapse / Explode buttons ───
let manualMode = false;
let manualExplode = false;

function setTopLinkActive(id) {
  document.querySelectorAll('.top-link').forEach(l => l.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

// Overview overlay
let overviewVisible = false;
const overviewEl = document.createElement('div');
overviewEl.id = 'overview-panel';
overviewEl.style.cssText = 'position:fixed;top:50px;right:20px;z-index:55;background:rgba(0,0,0,0.7);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px 24px;max-width:300px;display:none;color:#fff;font-family:Inter,sans-serif;';
document.body.appendChild(overviewEl);

function showOverview() {
  const totalParts = manifest.length;
  const asmList = ASSEMBLIES.map((a, i) => {
    const count = a.indices[1] - a.indices[0];
    return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <div style="width:8px;height:8px;border-radius:50%;background:${a.color};flex-shrink:0;"></div>
      <div style="flex:1;font-size:0.65rem;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.7);">${a.name}</div>
      <div style="font-size:0.6rem;color:rgba(255,255,255,0.35);">${count}</div>
    </div>`;
  }).join('');

  overviewEl.innerHTML = `
    <div style="font-size:0.5rem;letter-spacing:0.3em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:8px;">Model Overview</div>
    <div style="font-size:1.2rem;font-weight:700;color:#FFD100;">${CONFIG.productName}</div>
    <div style="font-size:0.6rem;color:rgba(255,255,255,0.4);margin-top:2px;">${CONFIG.brand}</div>
    <div style="display:flex;gap:20px;margin:16px 0;padding:12px 0;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
      <div><div style="font-size:1.4rem;font-weight:700;color:#fff;">${totalParts}</div><div style="font-size:0.45rem;letter-spacing:0.15em;color:rgba(255,255,255,0.3);text-transform:uppercase;">Components</div></div>
      <div><div style="font-size:1.4rem;font-weight:700;color:#fff;">${ASSEMBLIES.length}</div><div style="font-size:0.45rem;letter-spacing:0.15em;color:rgba(255,255,255,0.3);text-transform:uppercase;">Sub-Assemblies</div></div>
    </div>
    <div style="font-size:0.5rem;letter-spacing:0.15em;color:rgba(255,255,255,0.25);text-transform:uppercase;margin-bottom:6px;">Sub-Assemblies</div>
    ${asmList}
  `;
  overviewEl.style.display = 'block';
  overviewVisible = true;
}

function hideOverview() {
  overviewEl.style.display = 'none';
  overviewVisible = false;
}

document.getElementById('btn-overview').addEventListener('click', (e) => {
  e.preventDefault();
  manualMode = false;
  explodeLevel = 0;
  targetExplode = 0;
  targetDim = 0;
  activeAssembly = -1;
  window._userForcedRotate = false;
  window._isoMovedFor = null;
  cameraLocked = false;
  // Set fixed isometric view, no rotation
  controls.autoRotate = false;
  camera.position.set(3000, 1800, 3000);
  controls.target.set(0, 0, 0);
  setTopLinkActive('btn-overview');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (overviewVisible) hideOverview();
  else showOverview();
});

document.getElementById('btn-collapse').addEventListener('click', (e) => {
  e.preventDefault();
  hideOverview();
  manualMode = true;
  manualExplode = false;
  targetExplode = 0;
  explodeLevel = 0;
  targetDim = 0;
  activeAssembly = -1;
  setTopLinkActive('btn-collapse');
});

document.getElementById('btn-explode').addEventListener('click', (e) => {
  e.preventDefault();
  hideOverview();
  manualMode = true;
  manualExplode = true;
  targetExplode = 1;
  explodeLevel = 1;
  targetDim = 0;
  activeAssembly = -1;
  setTopLinkActive('btn-explode');
});

// btn-quote removed

// Exit manual mode when user scrolls
window.addEventListener('scroll', () => {
  if (manualMode && window.scrollY > window.innerHeight * 0.5) {
    manualMode = false;
    setTopLinkActive('btn-overview');
  }
}, { passive: true });

// ─── Bottom controls: prev/next + progress ───
const ctrlProgressFill = document.getElementById('ctrl-progress-fill');
const ctrlLabel = document.getElementById('ctrl-label');

document.getElementById('btn-prev').addEventListener('click', () => {
  const asmSections = document.querySelectorAll('.assembly-section');
  const target = activeAssembly > 0 ? activeAssembly - 1 : 0;
  if (asmSections[target]) {
    asmSections[target].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

document.getElementById('btn-next').addEventListener('click', () => {
  const asmSections = document.querySelectorAll('.assembly-section');
  const target = activeAssembly < ASSEMBLIES.length - 1 ? activeAssembly + 1 : ASSEMBLIES.length - 1;
  if (activeAssembly < 0) {
    // Not in assembly view yet, scroll to first
    if (asmSections[0]) asmSections[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else if (asmSections[target]) {
    asmSections[target].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// Update progress bar and label on scroll
function updateBottomControls() {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
  ctrlProgressFill.style.width = progress + '%';

  if (activeAssembly >= 0) {
    ctrlLabel.textContent = `${ASSEMBLIES[activeAssembly].name} — ${activeAssembly + 1}/${ASSEMBLIES.length}`;
  } else if (scrollY < window.innerHeight) {
    ctrlLabel.textContent = 'Scroll to explore';
  } else {
    ctrlLabel.textContent = 'cycleWASH Station Basic';
  }
}
window.addEventListener('scroll', updateBottomControls, { passive: true });

// ─── Wireframe Toggle ───
let wireframeOn = false;
document.getElementById('btn-wireframe').addEventListener('click', () => {
  wireframeOn = !wireframeOn;
  document.getElementById('btn-wireframe').classList.toggle('active', wireframeOn);
  for (const mesh of allParts) {
    mesh.material.wireframe = wireframeOn;
  }
});

// ─── Settings Panel ───
document.getElementById('btn-settings').addEventListener('click', () => {
  const panel = document.getElementById('settings-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  document.getElementById('btn-settings').classList.toggle('active');
});

// Brightness (tone mapping exposure)
document.getElementById('ctrl-brightness').addEventListener('input', (e) => {
  renderer.toneMappingExposure = e.target.value / 100;
});

// Contrast (ambient light intensity)
document.getElementById('ctrl-contrast').addEventListener('input', (e) => {
  const val = e.target.value / 100;
  // Adjust key light and fill light ratio for contrast effect
  keyLight.intensity = 3.5 * val;
  fillLight.intensity = 1.8 * (2 - val); // inverse — more contrast = less fill
});

// Ambient light
document.getElementById('ctrl-ambient').addEventListener('input', (e) => {
  ambientLight.intensity = e.target.value / 100;
});

// Background presets — solid colors and gradients
const gradientColors = {
  'gradient-sunset': [0xff7e5f, 0xfeb47b],
  'gradient-sky': [0x4facfe, 0x00f2fe],
  'gradient-forest': [0x134e5e, 0x71b280],
  'gradient-studio': [0x3a3a3a, 0x1a1a1a],
  'gradient-warm': [0xffd89b, 0x19547b],
  'gradient-ocean': [0x2193b0, 0x6dd5ed],
  'gradient-arctic': [0xe6dada, 0x274046],
  'gradient-dawn': [0xff9a9e, 0xfecfef],
  'gradient-night': [0x0f0c29, 0x24243e],
  'gradient-desert': [0xc2956e, 0xddd0a8],
};

function setGradientBackground(topColor, bottomColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 2; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  const tc = new THREE.Color(topColor);
  const bc = new THREE.Color(bottomColor);
  grad.addColorStop(0, '#' + tc.getHexString());
  grad.addColorStop(1, '#' + bc.getHexString());
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  ground.material.color.copy(bc).multiplyScalar(0.8);
}

document.querySelectorAll('.bg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const bg = btn.dataset.bg;
    document.querySelectorAll('.bg-btn').forEach(b => b.style.borderColor = 'rgba(255,255,255,0.08)');
    btn.style.borderColor = '#0055A4';

    if (bg.startsWith('gradient-')) {
      const [top, bot] = gradientColors[bg];
      setGradientBackground(top, bot);
    } else {
      scene.background = new THREE.Color(bg);
      ground.material.color.copy(new THREE.Color(bg)).multiplyScalar(0.6);
    }
  });
});

// Close settings when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#settings-panel') && !e.target.closest('#btn-settings')) {
    document.getElementById('settings-panel').style.display = 'none';
    document.getElementById('btn-settings').classList.remove('active');
  }
});

// ─── Start ───
loadModel();
animate();
