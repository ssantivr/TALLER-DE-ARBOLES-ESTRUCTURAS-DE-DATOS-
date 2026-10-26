const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";
const GAP_X = 66;
const GAP_Y = 116;
const R = 22;
const GUTTER = 86;
const SPEEDS = [1300, 900, 620, 400, 230];
const SPEED_LABELS = ["0.5x", "0.75x", "1x", "1.5x", "2x"];
const NAME_RE = /^\p{L}[\p{L}\p{N} .'\-]{0,39}$/u;
const PHONE_RE = /^\+?[0-9][0-9 ()\-]{5,18}[0-9]$/;
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 900px)");
const TYPE_LABELS = { root: "Raíz", branch: "Rama", leaf: "Hoja" };
const DIR_ES = { left: "izquierda", right: "derecha", found: "encontrado" };
const TRAV_LABELS = {
  inorder: "Inorden ascendente",
  inorder_desc: "Inorden descendente",
  preorder: "Preorden",
  postorder: "Postorden",
  levelorder: "Por niveles",
};
const TRAV_HINTS = {
  inorder: "Inorden: izquierda → nodo → derecha. Da los nombres en orden alfabético.",
  inorder_desc: "Inorden inverso: derecha → nodo → izquierda. Orden alfabético descendente.",
  preorder: "Preorden: nodo → izquierda → derecha. La raíz se visita primero.",
  postorder: "Postorden: izquierda → derecha → nodo. La raíz se visita al final.",
  levelorder: "Por niveles: nivel 1, luego nivel 2, y así sucesivamente (usa una cola).",
};
const TOKEN_ES = {
  root: "raíz", left: "izquierda", right: "derecha", found: "encontrado", not_found: "no encontrado",
  inserted: "insertado", updated: "actualizado", deleted: "eliminado",
};
const PREFIX = {
  ok: "Listo", err: "Error", info: "Información", search: "Búsqueda", insert: "Inserción", update: "Actualización",
  delete: "Eliminación", trav: "Recorrido", avl: "Balance AVL", num: "Ordenamiento", theory: "Teoría", step: "Paso",
};
const ICONS = {
  success: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  error: '<svg viewBox="0 0 24 24"><path d="M12 7v6M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 11v6M12 7h.01"/><circle cx="12" cy="12" r="9"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 4l9 16H3zM12 10v4M12 17h.01"/></svg>',
};

const GLOSSARY = [
  { key: "root", title: "Raíz", def: "Primer nodo del árbol; es el único sin padre." },
  { key: "node", title: "Nodo", def: "Cada elemento: guarda un dato y enlaces a sus hijos." },
  { key: "parent", title: "Padre", def: "Nodo que tiene al menos un hijo." },
  { key: "child", title: "Hijo", def: "Nodo que tiene un padre." },
  { key: "sibling", title: "Hermano", def: "Nodos que comparten el mismo padre." },
  { key: "leaf", title: "Hoja", def: "Nodo sin hijos, ubicado en los extremos." },
  { key: "branch", title: "Rama", def: "Nodo que no es raíz y tiene al menos un hijo." },
  { key: "height", title: "Altura", def: "Longitud del camino más largo de la raíz a una hoja." },
  { key: "level", title: "Nivel", def: "Raíz = 1, hijos = 2, nietos = 3…" },
  { key: "weight", title: "Peso", def: "Número total de nodos, incluyendo raíz y hojas." },
  { key: "order", title: "Orden", def: "Máximo de hijos que puede tener un nodo (binario = 2)." },
  { key: "degree", title: "Grado", def: "Número de hijos que tiene un nodo dado." },
];

const TREE_TYPES = [
  {
    name: "Binario", icon: "binary", tag: "este proyecto",
    desc: "Cada nodo tiene como máximo dos hijos: izquierdo y derecho.",
    use: "Base de los árboles binarios de búsqueda y de los AVL.",
  },
  {
    name: "n-ario", icon: "nary",
    desc: "Cada nodo puede tener hasta n hijos.",
    use: "Árboles genealógicos y árboles sintácticos.",
  },
  {
    name: "AVL", icon: "avl",
    desc: "BST donde la diferencia de alturas entre los subárboles izquierdo y derecho de cada nodo es ≤ 1.",
    use: "Búsquedas eficientes y balanceadas. Prueba «Rebalancear».",
  },
  {
    name: "B", icon: "b",
    desc: "Árbol de búsqueda multinivel: muchas claves e hijos por nodo.",
    use: "Bases de datos y sistemas de archivos.",
  },
  {
    name: "Rojo-negro", icon: "rb",
    desc: "BST con nodos rojos y negros; nunca hay dos rojos consecutivos.",
    use: "Balance óptimo y búsquedas más rápidas.",
  },
  {
    name: "Segmentos", icon: "segment",
    desc: "Guarda intervalos para búsquedas y cálculos por rangos sobre secuencias.",
    use: "Sistemas de información geográfica y análisis en bases de datos.",
  },
];

const TYPE_ICONS = {
  binary: '<path class="e" d="M22 7 12 19M22 7 32 19M12 19 7 30M12 19 17 30"/><circle class="r" cx="22" cy="7" r="4"/><circle class="b" cx="12" cy="19" r="3.5"/><circle class="l" cx="32" cy="19" r="3.5"/><circle class="l" cx="7" cy="30" r="3"/><circle class="l" cx="17" cy="30" r="3"/>',
  nary: '<path class="e" d="M22 8 6 27M22 8 16 27M22 8 28 27M22 8 38 27"/><circle class="r" cx="22" cy="8" r="4"/><circle class="l" cx="6" cy="27" r="3.2"/><circle class="l" cx="16" cy="27" r="3.2"/><circle class="l" cx="28" cy="27" r="3.2"/><circle class="l" cx="38" cy="27" r="3.2"/>',
  avl: '<path class="e" d="M22 6 12 17M22 6 32 17M12 17 7 29M12 17 17 29M32 17 27 29M32 17 37 29"/><circle class="r" cx="22" cy="6" r="3.6"/><circle class="b" cx="12" cy="17" r="3.2"/><circle class="b" cx="32" cy="17" r="3.2"/><circle class="l" cx="7" cy="29" r="2.8"/><circle class="l" cx="17" cy="29" r="2.8"/><circle class="l" cx="27" cy="29" r="2.8"/><circle class="l" cx="37" cy="29" r="2.8"/>',
  b: '<rect class="key" x="10" y="3" width="24" height="9" rx="2"/><path class="e" d="M18 3v9M26 3v9M10 12 5 24M18 12 16 24M26 12 28 24M34 12 39 24"/><rect class="key" x="1" y="24" width="9" height="8" rx="2"/><rect class="key" x="12" y="24" width="9" height="8" rx="2"/><rect class="key" x="24" y="24" width="9" height="8" rx="2"/><rect class="key" x="35" y="24" width="8" height="8" rx="2"/>',
  rb: '<path class="e" d="M22 7 12 19M22 7 32 19M12 19 7 30M12 19 17 30M32 19 37 30"/><circle class="blk" cx="22" cy="7" r="4"/><circle class="red" cx="12" cy="19" r="3.5"/><circle class="red" cx="32" cy="19" r="3.5"/><circle class="blk" cx="7" cy="30" r="3"/><circle class="blk" cx="17" cy="30" r="3"/><circle class="blk" cx="37" cy="30" r="3"/>',
  segment: '<rect class="seg" x="4" y="4" width="36" height="6" rx="2"/><rect class="seg" x="4" y="15" width="17" height="6" rx="2" opacity=".75"/><rect class="seg" x="23" y="15" width="17" height="6" rx="2" opacity=".75"/><rect class="seg" x="4" y="26" width="8" height="6" rx="2" opacity=".55"/><rect class="seg" x="13" y="26" width="8" height="6" rx="2" opacity=".55"/><rect class="seg" x="23" y="26" width="8" height="6" rx="2" opacity=".55"/><rect class="seg" x="32" y="26" width="8" height="6" rx="2" opacity=".55"/>',
};

const state = {
  tree: null,
  metrics: null,
  layout: new Map(),
  levels: 0,
  nodes: new Map(),
  edges: new Map(),
  selected: null,
  view: { x: 0, y: 0, k: 1 },
  wrap: { w: 800, h: 500 },
  raf: 0,
  viewRaf: 0,
  drag: null,
  busy: false,
  bubbleFor: null,
  speed: 3,
  idSeq: 0,
  mm: null,
  mmView: null,
  trav: { type: "inorder", seq: [], i: 0, playing: false, timer: 0 },
  theory: { pinned: null, active: null },
  numKnown: new Set(),
};

function reduced() {
  return motionQuery.matches;
}

function stepMs() {
  return reduced() ? 160 : SPEEDS[state.speed - 1];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function initials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function shortLabel(name) {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}

function svg(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  if (parent) parent.appendChild(el);
  return el;
}

function html(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined && text !== null) el.textContent = text;
  return el;
}

async function api(path, body) {
  const options = body === undefined
    ? {}
    : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
  let response;
  try {
    response = await fetch(path, options);
  } catch (error) {
    throw new Error("No se pudo conectar con el servidor");
  }
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }
  if (!response.ok) {
    const error = new Error((data && data.error) || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function computeLayout(tree) {
  const map = new Map();
  let index = 0;
  const visit = (node, parent) => {
    if (!node) return;
    visit(node.left, node);
    map.set(node.name, { x: index++ * GAP_X, y: (node.level - 1) * GAP_Y, node, parent: parent ? parent.name : null });
    visit(node.right, node);
  };
  visit(tree, null);
  return map;
}

function edgePath(a, b) {
  const y1 = a.y + R;
  const y2 = b.y - R;
  const my = (y1 + y2) / 2;
  return `M${a.x.toFixed(2)},${y1.toFixed(2)} C${a.x.toFixed(2)},${my.toFixed(2)} ${b.x.toFixed(2)},${my.toFixed(2)} ${b.x.toFixed(2)},${y2.toFixed(2)}`;
}

function spawnPoint(name, next) {
  let parent = next.get(name).parent;
  while (parent) {
    const rec = state.nodes.get(parent);
    if (rec && !rec.leaving) return { ...rec.cur };
    parent = next.get(parent).parent;
  }
  for (const p of next.values()) if (!p.parent) return { x: p.x, y: p.y };
  return { x: 0, y: 0 };
}

function createNode(name) {
  const g = svg("g", { class: "node", tabindex: "0", role: "button" });
  g.dataset.name = name;
  const nb = svg("g", { class: "nb entering" }, g);
  svg("circle", { class: "halo", r: 34 }, nb);
  svg("circle", { class: "ring", r: 29.5 }, nb);
  svg("circle", { class: "core", r: R }, nb);
  svg("circle", { class: "gloss", r: R - 1 }, nb);
  const ini = svg("text", { class: "ini", y: 4.5 }, nb);
  const labelBg = svg("rect", { class: "label-bg", y: R + 7, height: 21, rx: 10.5 }, nb);
  const label = svg("text", { class: "label", y: R + 22 }, nb);
  const badge = svg("g", { class: "badge", transform: `translate(${R - 3},${-R + 3})` }, nb);
  const bi = svg("g", { class: "bi" }, badge);
  svg("circle", { r: 10.5 }, bi);
  const badgeText = svg("text", { y: 3.8 }, bi);
  const tbadge = svg("g", { class: "tbadge", transform: `translate(${-R + 3},${-R + 3})` }, nb);
  const tbi = svg("g", { class: "bi" }, tbadge);
  svg("circle", { r: 10.5 }, tbi);
  const tbText = svg("text", { y: 3.8 }, tbi);
  const done = event => {
    if (event.target === nb && event.animationName === "pop") {
      nb.classList.remove("entering");
      nb.removeEventListener("animationend", done);
    }
  };
  nb.addEventListener("animationend", done);
  g.addEventListener("pointerdown", event => event.stopPropagation());
  g.addEventListener("click", event => {
    event.stopPropagation();
    select(name);
  });
  g.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      select(name);
    }
  });
  return { g, nb, ini, label, labelBg, badgeText, tbText, cur: { x: 0, y: 0 }, leaving: false, data: null };
}

function updateNode(rec, node) {
  rec.g.classList.remove("t-root", "t-branch", "t-leaf");
  rec.g.classList.add(`t-${node.type}`);
  rec.ini.textContent = initials(node.name);
  const text = shortLabel(node.name);
  rec.label.textContent = text;
  const width = Math.max(30, text.length * 7.4 + 18);
  rec.labelBg.setAttribute("x", (-width / 2).toFixed(1));
  rec.labelBg.setAttribute("width", width.toFixed(1));
  rec.g.setAttribute("aria-label", `${node.name}, ${TYPE_LABELS[node.type]}, nivel ${node.level}, teléfono ${node.phone}`);
  rec.data = node;
}

function removeNode(name, rec) {
  rec.leaving = true;
  rec.g.classList.remove("selected", "unbal", "hl");
  rec.g.style.pointerEvents = "none";
  rec.g.removeAttribute("tabindex");
  rec.nb.classList.remove("entering");
  rec.nb.classList.add("leaving");
  setTimeout(() => {
    rec.g.remove();
    if (state.nodes.get(name) === rec) state.nodes.delete(name);
  }, reduced() ? 0 : 480);
}

function removeEdge(child, edge) {
  state.edges.delete(child);
  if (edge.dot) edge.dot.remove();
  edge.path.classList.add("leaving");
  setTimeout(() => edge.path.remove(), reduced() ? 0 : 420);
}

function syncEdges(next) {
  for (const [child, edge] of [...state.edges]) {
    const p = next.get(child);
    if (!p || !p.parent) removeEdge(child, edge);
    else edge.parent = p.parent;
  }
  for (const [name, p] of next) {
    if (!p.parent || state.edges.has(name)) continue;
    const id = `edge-${++state.idSeq}`;
    const path = svg("path", { class: "edge drawing", id, pathLength: "1" }, $("#edges"));
    path.addEventListener("animationend", () => path.classList.remove("drawing"), { once: true });
    let dot = null;
    if (!reduced()) {
      dot = svg("circle", { class: "particle", r: "2.6" }, $("#particles"));
      const motion = svg("animateMotion", {
        dur: `${(2.2 + Math.random() * 1.4).toFixed(2)}s`,
        repeatCount: "indefinite",
        begin: `${(-Math.random() * 3).toFixed(2)}s`,
      }, dot);
      const mpath = svg("mpath", {}, motion);
      mpath.setAttribute("href", `#${id}`);
      mpath.setAttributeNS(XLINK_NS, "xlink:href", `#${id}`);
    }
    state.edges.set(name, { path, dot, parent: p.parent });
  }
}

function updateEdges() {
  for (const [child, edge] of state.edges) {
    const a = state.nodes.get(edge.parent);
    const b = state.nodes.get(child);
    if (a && b) edge.path.setAttribute("d", edgePath(a.cur, b.cur));
  }
}

function easeSpring(t) {
  if (t >= 1) return 1;
  return 1 - Math.exp(-6 * t) * Math.cos(7.5 * t);
}

function tween(duration) {
  cancelAnimationFrame(state.raf);
  const items = [];
  for (const [name, rec] of state.nodes) {
    if (rec.leaving) continue;
    const target = state.layout.get(name);
    if (target) items.push({ rec, sx: rec.cur.x, sy: rec.cur.y, tx: target.x, ty: target.y });
  }
  const total = reduced() ? 0 : duration;
  const start = performance.now();
  const frame = now => {
    const t = total ? Math.min(1, Math.max(0, (now - start) / total)) : 1;
    const e = easeSpring(t);
    for (const item of items) {
      item.rec.cur = { x: item.sx + (item.tx - item.sx) * e, y: item.sy + (item.ty - item.sy) * e };
      item.rec.g.setAttribute("transform", `translate(${item.rec.cur.x.toFixed(2)},${item.rec.cur.y.toFixed(2)})`);
    }
    updateEdges();
    positionBubble();
    if (t < 1) state.raf = requestAnimationFrame(frame);
  };
  frame(start);
}

function render(tree, duration = 750) {
  stopTraversal(true);
  const next = tree ? computeLayout(tree) : new Map();
  state.tree = tree;
  for (const [name, rec] of [...state.nodes]) {
    if (rec.leaving && next.has(name)) {
      rec.g.remove();
      state.nodes.delete(name);
    }
  }
  const spawns = new Map();
  for (const name of next.keys()) if (!state.nodes.has(name)) spawns.set(name, spawnPoint(name, next));
  for (const [name, rec] of [...state.nodes]) if (!next.has(name) && !rec.leaving) removeNode(name, rec);
  for (const [name, p] of next) {
    let rec = state.nodes.get(name);
    if (!rec) {
      rec = createNode(name);
      rec.cur = spawns.get(name);
      rec.g.setAttribute("transform", `translate(${rec.cur.x},${rec.cur.y})`);
      $("#nodes").appendChild(rec.g);
      state.nodes.set(name, rec);
    }
    updateNode(rec, p.node);
  }
  state.layout = next;
  state.levels = 0;
  for (const p of next.values()) state.levels = Math.max(state.levels, p.node.level);
  syncEdges(next);
  tween(duration);
  afterRender();
}

function afterRender() {
  const empty = !state.tree;
  $("#empty").hidden = !empty;
  if (state.selected && !state.layout.has(state.selected)) state.selected = null;
  select(state.selected);
  updateBands();
  renderMinimap();
  updateDatalist();
  if (state.theory.active) applyTheory(state.theory.active);
}

function bump(el) {
  if (!el || reduced()) return;
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

function nodePos(name) {
  const target = state.layout.get(name);
  if (target) return { x: target.x, y: target.y };
  const rec = state.nodes.get(name);
  return rec ? rec.cur : null;
}

function shock(name, color) {
  if (reduced()) return;
  const p = nodePos(name);
  if (!p) return;
  const g = svg("g", { transform: `translate(${p.x},${p.y})` }, $("#fx"));
  for (let i = 0; i < 2; i++) {
    const ring = svg("circle", { class: "shock", r: R }, g);
    ring.style.stroke = color;
    ring.style.animationDelay = `${i * 160}ms`;
  }
  setTimeout(() => g.remove(), 1300);
}

function travel(from, to, duration) {
  if (reduced() || !from || !to || from === to) return Promise.resolve();
  const a = state.nodes.get(from)?.cur;
  const b = state.nodes.get(to)?.cur;
  if (!a || !b) return Promise.resolve();
  const down = state.edges.get(to);
  const up = state.edges.get(from);
  let pointAt;
  if (down && down.parent === from && down.path.getAttribute("d")) {
    const length = down.path.getTotalLength();
    pointAt = t => down.path.getPointAtLength(length * t);
  } else if (up && up.parent === to && up.path.getAttribute("d")) {
    const length = up.path.getTotalLength();
    pointAt = t => up.path.getPointAtLength(length * (1 - t));
  } else {
    const mx = (a.x + b.x) / 2;
    const my = Math.min(a.y, b.y) - 46;
    pointAt = t => ({
      x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x,
      y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y,
    });
  }
  const fx = $("#fx");
  const trail = [0, 1, 2, 3].map(i => svg("circle", { class: "comet-trail", r: 4.5 - i, opacity: (0.55 - i * 0.12).toFixed(2) }, fx));
  const comet = svg("g", {}, fx);
  svg("circle", { class: "comet-glow", r: 12 }, comet);
  svg("circle", { class: "comet-core", r: 3.4 }, comet);
  return new Promise(resolve => {
    const start = performance.now();
    const frame = now => {
      const t = Math.min(1, (now - start) / duration);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const p = pointAt(e);
      comet.setAttribute("transform", `translate(${p.x.toFixed(2)},${p.y.toFixed(2)})`);
      trail.forEach((dot, i) => {
        const q = pointAt(Math.max(0, e - (i + 1) * 0.06));
        dot.setAttribute("cx", q.x.toFixed(2));
        dot.setAttribute("cy", q.y.toFixed(2));
      });
      if (t < 1) requestAnimationFrame(frame);
      else {
        comet.remove();
        trail.forEach(dot => dot.remove());
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}

function expandCard(id) {
  const card = document.getElementById(id);
  if (!card) return;
  card.classList.remove("collapsed");
  $(".toggle", card)?.setAttribute("aria-expanded", "true");
}

function setMetrics(metrics) {
  const prev = state.metrics;
  if (prev) {
    [["cHeight", "height"], ["cWeight", "weight"], ["cRoot", "root"], ["cLeaves", "leaf_count"],
      ["cBranches", "branch_count"], ["cMin", "min"], ["cMax", "max"], ["mAvl", "avl_balanced"]]
      .forEach(([id, key]) => {
        if (prev[key] !== metrics[key]) bump(document.getElementById(id));
      });
  }
  state.metrics = metrics;
  const optimal = metrics.weight ? Math.ceil(Math.log2(metrics.weight + 1)) : 0;
  $("#mHeightSub").textContent = metrics.empty ? "niveles" : `mínima posible: ${optimal}`;
  $("#canvasSub").textContent = metrics.empty ? "vacío" : `${metrics.weight} nodos · ${metrics.height} niveles`;
  countTo($("#mHeight"), metrics.height);
  countTo($("#mWeight"), metrics.weight);
  $("#mOrder").textContent = metrics.order;
  $("#mRoot").textContent = metrics.root || "—";
  countTo($("#mLeaves"), metrics.leaf_count);
  countTo($("#mBranches"), metrics.branch_count);
  $("#mMin").textContent = metrics.min || "—";
  $("#mMax").textContent = metrics.max || "—";
  const avl = $("#mAvl");
  avl.classList.remove("yes", "no", "neutral");
  if (metrics.empty) {
    avl.classList.add("neutral");
    $("#mAvlVal").textContent = "—";
    $("#mAvlNode").textContent = "árbol vacío";
  } else if (metrics.avl_balanced) {
    avl.classList.add("yes");
    $("#mAvlVal").textContent = "Sí";
    $("#mAvlNode").textContent = "|FE| ≤ 1 en todos";
  } else {
    avl.classList.add("no");
    $("#mAvlVal").textContent = "No";
    $("#mAvlNode").textContent = `desbalance en ${metrics.unbalanced_node}`;
  }
  avl.setAttribute("aria-label", `AVL balanceado: ${metrics.avl_balanced ? "sí" : "no"}${metrics.unbalanced_node ? `, nodo ${metrics.unbalanced_node}` : ""}`);
  for (const [name, rec] of state.nodes) rec.g.classList.toggle("unbal", !rec.leaving && name === metrics.unbalanced_node);
  refreshGlossary();
}

function countTo(el, value) {
  const from = Number(el.dataset.v || 0);
  el.dataset.v = value;
  cancelAnimationFrame(el._raf);
  if (reduced() || from === value) {
    el.textContent = value;
    return;
  }
  const start = performance.now();
  const tick = now => {
    const t = Math.min(1, (now - start) / 700);
    const e = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (value - from) * e);
    if (t < 1) el._raf = requestAnimationFrame(tick);
  };
  el._raf = requestAnimationFrame(tick);
}

function applyView() {
  const { x, y, k } = state.view;
  $("#viewport").setAttribute("transform", `translate(${x.toFixed(2)},${y.toFixed(2)}) scale(${k.toFixed(4)})`);
  updateBands();
  updateMinimapView();
  positionBubble();
}

function animateView(target, duration = 550) {
  cancelAnimationFrame(state.viewRaf);
  const from = { ...state.view };
  const total = reduced() ? 0 : duration;
  const start = performance.now();
  const frame = now => {
    const t = total ? Math.min(1, Math.max(0, (now - start) / total)) : 1;
    const e = 1 - Math.pow(1 - t, 3);
    state.view = {
      x: from.x + (target.x - from.x) * e,
      y: from.y + (target.y - from.y) * e,
      k: from.k + (target.k - from.k) * e,
    };
    applyView();
    if (t < 1) state.viewRaf = requestAnimationFrame(frame);
  };
  frame(start);
}

function layoutBounds() {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of state.layout.values()) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  if (minX === Infinity) return null;
  return { minX: minX - 60, maxX: maxX + 60, minY: minY - 46, maxY: maxY + R + 36 };
}

function fit(animate = true) {
  const bounds = layoutBounds();
  const { w, h } = state.wrap;
  if (!bounds || !w) return;
  const availW = w - GUTTER - 20;
  const availH = h - 64;
  const bw = bounds.maxX - bounds.minX;
  const bh = bounds.maxY - bounds.minY;
  const k = Math.max(0.18, Math.min(1.25, availW / bw, availH / bh));
  const target = {
    k,
    x: GUTTER + (availW - bw * k) / 2 - bounds.minX * k,
    y: 52 + (availH - bh * k) / 2 - bounds.minY * k,
  };
  if (animate) animateView(target);
  else {
    state.view = target;
    applyView();
  }
}

function zoomAt(cx, cy, factor) {
  const { x, y, k } = state.view;
  const nk = Math.max(0.15, Math.min(3, k * factor));
  const ratio = nk / k;
  state.view = { k: nk, x: cx - (cx - x) * ratio, y: cy - (cy - y) * ratio };
  applyView();
}

function screenOf(name) {
  const rec = state.nodes.get(name);
  if (!rec) return null;
  const { x, y, k } = state.view;
  return { x: x + rec.cur.x * k, y: y + rec.cur.y * k };
}

function ensureVisible(name) {
  const p = state.layout.get(name);
  if (!p) return;
  const { x, y, k } = state.view;
  const sx = x + p.x * k;
  const sy = y + p.y * k;
  const { w, h } = state.wrap;
  if (sx > GUTTER + 30 && sx < w - 40 && sy > 60 && sy < h - 60) return;
  animateView({ k, x: w / 2 - p.x * k, y: h / 2 - p.y * k });
}

function updateBands() {
  const group = $("#bands");
  const levels = state.levels;
  while (group.children.length > levels) group.lastChild.remove();
  while (group.children.length < levels) {
    const i = group.children.length;
    const row = svg("g", { class: `band-row${i % 2 ? " alt" : ""}` }, group);
    svg("rect", { class: "band", x: 0, width: "100%" }, row);
    svg("rect", { class: "band-pill", x: 12, width: 64, height: 22, rx: 11 }, row);
    const text = svg("text", { class: "band-label", x: 44 }, row);
    text.textContent = `Nivel ${i + 1}`;
  }
  const { y, k } = state.view;
  Array.from(group.children).forEach((row, i) => {
    const cy = y + i * GAP_Y * k;
    const [band, pill, text] = row.children;
    band.setAttribute("y", (cy - (GAP_Y * k) / 2).toFixed(2));
    band.setAttribute("height", (GAP_Y * k).toFixed(2));
    pill.setAttribute("y", (cy - 11).toFixed(2));
    text.setAttribute("y", (cy + 3.8).toFixed(2));
  });
}

function renderMinimap() {
  const mm = $("#minimap");
  mm.innerHTML = "";
  const bounds = layoutBounds();
  $("#minimapBox").classList.toggle("hidden", !bounds);
  state.mmView = null;
  if (!bounds) {
    state.mm = null;
    return;
  }
  const W = 168;
  const H = 104;
  const pad = 9;
  const bw = bounds.maxX - bounds.minX;
  const bh = bounds.maxY - bounds.minY;
  const s = Math.min((W - pad * 2) / bw, (H - pad * 2) / bh);
  const ox = pad + ((W - pad * 2) - bw * s) / 2 - bounds.minX * s;
  const oy = pad + ((H - pad * 2) - bh * s) / 2 - bounds.minY * s;
  state.mm = { s, ox, oy, W, H };
  for (const p of state.layout.values()) {
    if (!p.parent) continue;
    const q = state.layout.get(p.parent);
    svg("line", { class: "mm-edge", x1: ox + q.x * s, y1: oy + q.y * s, x2: ox + p.x * s, y2: oy + p.y * s }, mm);
  }
  const r = Math.max(1.8, Math.min(5, R * s));
  for (const p of state.layout.values()) svg("circle", { class: `mm-node t-${p.node.type}`, cx: ox + p.x * s, cy: oy + p.y * s, r }, mm);
  state.mmView = svg("rect", { class: "mm-view", rx: 3 }, mm);
  updateMinimapView();
}

function updateMinimapView() {
  if (!state.mm || !state.mmView) return;
  const { x, y, k } = state.view;
  const { s, ox, oy } = state.mm;
  const { w, h } = state.wrap;
  state.mmView.setAttribute("x", (ox + (-x / k) * s).toFixed(2));
  state.mmView.setAttribute("y", (oy + (-y / k) * s).toFixed(2));
  state.mmView.setAttribute("width", Math.max(2, (w / k) * s).toFixed(2));
  state.mmView.setAttribute("height", Math.max(2, (h / k) * s).toFixed(2));
}

function select(name) {
  state.selected = name && state.layout.has(name) ? name : null;
  for (const [n, rec] of state.nodes) rec.g.classList.toggle("selected", n === state.selected);
  document.body.classList.toggle("has-selection", Boolean(state.selected));
  renderInspector();
  if (["sibling", "level", "degree"].includes(state.theory.active)) applyTheory(state.theory.active);
  refreshGlossary();
}

function nodeInfo(name) {
  const p = state.layout.get(name);
  if (!p) return null;
  let siblings = [];
  if (p.parent) {
    const parentNode = state.layout.get(p.parent).node;
    siblings = [parentNode.left, parentNode.right].filter(c => c && c.name !== name).map(c => c.name);
  }
  return { ...p.node, parent: p.parent, siblings };
}

function gotoButton(name, prefix) {
  return `<button type="button" class="goto" data-goto="${esc(name)}">${prefix ? `<small>${prefix}</small>` : ""}${esc(name)}</button>`;
}

function renderInspector() {
  const body = $("#inspectorBody");
  const info = state.selected ? nodeInfo(state.selected) : null;
  if (!info) {
    body.innerHTML = `
      <div class="insp-empty">
        <div class="insp-illus" aria-hidden="true">
          <svg viewBox="0 0 40 40"><path d="M20 10 12 22M20 10 28 22M12 22 8 32M12 22 16 32" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" opacity=".5"/><circle cx="20" cy="9" r="4.5" fill="#ff9f1c"/><circle cx="12" cy="22" r="3.6" fill="#7cc4ff"/><circle cx="28" cy="22" r="3.6" fill="#7ddc6b"/><circle cx="8" cy="32" r="3" fill="#7ddc6b"/><circle cx="16" cy="32" r="3" fill="#7ddc6b"/></svg>
        </div>
        <h3>Inspector de nodo</h3>
        <p>Selecciona un nodo del lienzo para ver su teléfono, rol, stack, nivel, grado, padre, hermanos y factor de equilibrio.</p>
        <ul class="kbd-list">
          <li><kbd>/</kbd><span>buscar</span></li>
          <li><kbd>i</kbd><span>insertar</span></li>
          <li><kbd>espacio</kbd><span>recorrido</span></li>
          <li><kbd>f</kbd><span>ajustar vista</span></li>
        </ul>
      </div>`;
    return;
  }
  const bf = info.balance_factor;
  const children = [info.left ? gotoButton(info.left.name, "izq") : "", info.right ? gotoButton(info.right.name, "der") : ""].join("");
  body.innerHTML = `
    <div class="insp">
      <div class="insp-head">
        <div class="avatar t-${info.type}" aria-hidden="true">${esc(initials(info.name))}</div>
        <div class="insp-title">
          <h2 title="${esc(info.name)}">${esc(info.name)}</h2>
          <span class="type-badge t-${info.type}">${TYPE_LABELS[info.type]}</span>
        </div>
        <button type="button" class="icon-btn sm close-insp" id="btnCloseInsp" aria-label="Cerrar inspector">×</button>
      </div>
      <div class="insp-phone">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>
        <span>${esc(info.phone)}</span>
        <button type="button" class="icon-btn sm" id="btnCopy" aria-label="Copiar teléfono"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/></svg></button>
      </div>
      <span class="role-pill">${esc(info.role || "Sin rol")}</span>
      <div class="insp-sec">Stack</div>
      <div class="chips stack">${info.stack.length ? info.stack.map(s => `<span class="chip static">${esc(s)}</span>`).join("") : '<span class="hint">Sin tecnologías</span>'}</div>
      <dl class="insp-grid">
        <div><dt>Nivel</dt><dd>${info.level}</dd></div>
        <div><dt>Grado</dt><dd>${info.degree} <span class="muted">/ 2</span></dd></div>
        <div><dt>Padre</dt><dd>${info.parent ? gotoButton(info.parent) : '<span class="muted">— raíz</span>'}</dd></div>
        <div><dt>Hermanos</dt><dd>${info.siblings.length ? info.siblings.map(s => gotoButton(s)).join("") : '<span class="muted">—</span>'}</dd></div>
        <div class="wide"><dt>Hijos</dt><dd>${children || '<span class="muted">ninguno (hoja)</span>'}</dd></div>
        <div><dt>Factor equilibrio</dt><dd class="bf ${Math.abs(bf) > 1 ? "bad" : "good"}">${bf > 0 ? "+" : ""}${bf}</dd></div>
        <div><dt>Altura subárbol</dt><dd>${info.height}</dd></div>
      </dl>
      <div class="insp-actions">
        <button type="button" class="btn" id="btnEdit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>Editar</button>
        <button type="button" class="btn danger" id="btnDel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>Eliminar</button>
      </div>
    </div>`;
  $$("[data-goto]", body).forEach(btn => btn.addEventListener("click", () => {
    select(btn.dataset.goto);
    ensureVisible(btn.dataset.goto);
  }));
  $("#btnCloseInsp", body).addEventListener("click", () => select(null));
  $("#btnCopy", body).addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(info.phone);
      toast("success", "Copiado", `${info.phone} en el portapapeles`);
    } catch (error) {
      toast("error", "No se pudo copiar", "El navegador bloqueó el portapapeles");
    }
  });
  $("#btnEdit", body).addEventListener("click", () => editNode(info));
  $("#btnDel", body).addEventListener("click", () => runDelete(info.name));
}

function editNode(info) {
  switchTab("dir");
  openSheet();
  expandCard("upsertCard");
  $("#fName").value = info.name;
  $("#fPhone").value = info.phone;
  if (info.role && ![...$("#fRole").options].some(o => o.value === info.role)) $("#fRole").add(new Option(info.role, info.role));
  $("#fRole").value = info.role || "Backend";
  $("#fStack").value = info.stack.join(", ");
  $("#upsertCard").scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
  $("#fPhone").focus();
  $("#fPhone").select();
}

function clearMarks() {
  for (const rec of state.nodes.values()) rec.g.classList.remove("visit", "found", "doomed", "successor");
  for (const edge of state.edges.values()) edge.path.classList.remove("hot");
  hideBubble();
  $("#caseBanner").classList.remove("show");
}

function showBubble(name, text, kind = "") {
  const bubble = $("#bubble");
  bubble.textContent = text;
  bubble.className = `bubble ${kind}`;
  state.bubbleFor = name;
  positionBubble();
  void bubble.offsetWidth;
  bubble.classList.add("show");
}

function positionBubble() {
  if (!state.bubbleFor) return;
  const pos = screenOf(state.bubbleFor);
  if (!pos) return;
  const bubble = $("#bubble");
  bubble.style.left = `${pos.x}px`;
  bubble.style.top = `${pos.y - (R + 8) * state.view.k}px`;
}

function hideBubble() {
  state.bubbleFor = null;
  $("#bubble").classList.remove("show");
}

function showCase(html) {
  const banner = $("#caseBanner");
  banner.innerHTML = html;
  banner.classList.add("show");
}

function shake() {
  const wrap = $("#canvasWrap");
  wrap.classList.remove("shake");
  void wrap.offsetWidth;
  wrap.classList.add("shake");
}

function confettiAt(name) {
  if (reduced()) return;
  const pos = screenOf(name);
  if (!pos) return;
  const rect = $("#canvasWrap").getBoundingClientRect();
  const cx = rect.left + pos.x;
  const cy = rect.top + pos.y;
  const layer = $("#confetti");
  const colors = ["#ff9f1c", "#7cc4ff", "#7ddc6b", "#a78bfa", "#22d3ee", "#ff5d73", "#ffd166"];
  for (let i = 0; i < 46; i++) {
    const piece = html("i", "confetti");
    piece.style.left = `${cx}px`;
    piece.style.top = `${cy}px`;
    piece.style.background = colors[i % colors.length];
    if (i % 3 === 0) piece.style.borderRadius = "50%";
    layer.appendChild(piece);
    const angle = Math.random() * Math.PI * 2;
    const speed = 70 + Math.random() * 130;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 70;
    const rot = Math.random() * 900 - 450;
    const animation = piece.animate([
      { transform: "translate(0,0) rotate(0deg) scale(.4)", opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) rotate(${rot / 2}deg) scale(1)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${dx * 1.35}px,${dy + 190}px) rotate(${rot}deg) scale(.7)`, opacity: 0 },
    ], { duration: 1200 + Math.random() * 600, easing: "cubic-bezier(.2,.7,.3,1)" });
    animation.onfinish = () => piece.remove();
  }
}

function toast(kind, title, message) {
  const box = html("div", `toast ${kind}`);
  box.setAttribute("role", kind === "error" ? "alert" : "status");
  box.innerHTML = `<span class="ti">${ICONS[kind] || ICONS.info}</span><div class="tt"><b></b><span></span></div><button type="button" aria-label="Cerrar notificación">×</button>`;
  $("b", box).textContent = title;
  $(".tt span", box).textContent = message || "";
  const dismiss = () => {
    if (box.classList.contains("out")) return;
    box.classList.add("out");
    setTimeout(() => box.remove(), reduced() ? 0 : 340);
  };
  $("button", box).addEventListener("click", dismiss);
  $("#toasts").appendChild(box);
  while ($("#toasts").children.length > 4) $("#toasts").firstElementChild.remove();
  setTimeout(dismiss, 4000);
}

function log(kind, text) {
  const line = html("div", `ln ${kind}`);
  const now = new Date();
  line.appendChild(html("span", "tm", now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })));
  line.appendChild(html("span", `pf pf-${kind}`, PREFIX[kind] || kind));
  line.appendChild(html("span", "tx", text));
  const box = $("#log");
  box.appendChild(line);
  while (box.children.length > 220) box.firstElementChild.remove();
  box.scrollTop = box.scrollHeight;
}

function setPath(tokens) {
  const code = $("#pathCode");
  code.innerHTML = "";
  tokens.forEach((token, i) => {
    if (i) code.appendChild(html("span", "sep", "→"));
    let cls = "tok";
    if (["found", "inserted", "updated", "deleted"].includes(token)) cls += " ok";
    if (token === "not_found") cls += " bad";
    if (token === "root") cls += " root";
    code.appendChild(html("span", cls, TOKEN_ES[token] || token));
  });
  code.scrollLeft = code.scrollWidth;
}

function fieldError(input, message) {
  const field = input.closest(".field");
  if (field) {
    field.classList.remove("invalid");
    void field.offsetWidth;
    field.classList.add("invalid");
    const err = $(".err", field);
    if (err) err.textContent = message;
  } else {
    toast("error", "Dato inválido", message);
  }
  input.focus();
}

function clearFieldError(input) {
  const field = input.closest(".field");
  if (field) field.classList.remove("invalid");
}

function validName(input) {
  const value = input.value.trim().replace(/\s+/g, " ");
  if (!value) {
    fieldError(input, "Escribe un nombre");
    return null;
  }
  if (!NAME_RE.test(value)) {
    fieldError(input, "Solo letras, espacios y máximo 40 caracteres");
    return null;
  }
  clearFieldError(input);
  return value;
}

function validPhone(input, required) {
  const value = input.value.trim();
  if (!value && !required) return "";
  if (!value) {
    fieldError(input, "Escribe un teléfono");
    return null;
  }
  if (!PHONE_RE.test(value)) {
    fieldError(input, "Formato: 310-555-0101 o 111-1111");
    return null;
  }
  clearFieldError(input);
  return value;
}

function parseStack(value) {
  return value.split(",").map(s => s.trim()).filter(Boolean).slice(0, 8);
}

async function guarded(task) {
  if (state.busy) {
    toast("info", "Animación en curso", "Espera a que termine la operación actual");
    return;
  }
  state.busy = true;
  document.body.classList.add("busy");
  try {
    await task();
  } catch (error) {
    reportError(error);
  } finally {
    state.busy = false;
    document.body.classList.remove("busy");
  }
}

function reportError(error) {
  toast("error", error.status === 404 ? "No encontrado" : "Error", error.message);
  log("err", error.message);
}

async function walkComparisons(comparisons, target) {
  for (let i = 0; i < comparisons.length; i++) {
    const step = comparisons[i];
    const rec = state.nodes.get(step.node);
    if (!rec) continue;
    if (i > 0) await travel(comparisons[i - 1].node, step.node, Math.min(520, stepMs() * 0.5));
    rec.g.classList.add("visit");
    const edge = i > 0 ? state.edges.get(step.node) : null;
    if (edge) edge.path.classList.add("hot");
    const text = step.relation === "="
      ? `${target} = ${step.node} → encontrado`
      : `${target} ${step.relation} ${step.node} → ${DIR_ES[step.direction]}`;
    showBubble(step.node, text, step.relation === "=" ? "ok" : "");
    log("step", step.relation === "="
      ? `${target} coincide con ${step.node}: encontrado`
      : `${target} es ${step.relation === "<" ? "menor" : "mayor"} que ${step.node} (orden alfabético), baja a la ${DIR_ES[step.direction]}`);
    await sleep(stepMs() * 0.7);
  }
}

function runSearch(raw) {
  const name = String(raw || "").trim().replace(/\s+/g, " ");
  if (!name) {
    fieldError($("#searchName"), "Escribe un nombre");
    return;
  }
  return guarded(async () => {
    stopTraversal(true);
    clearMarks();
    const result = await api(`/api/search?name=${encodeURIComponent(name)}`);
    log("search", `Buscando a ${name} desde la raíz`);
    await walkComparisons(result.comparisons, name);
    setPath(result.directions);
    if (result.found) {
      const data = result.data;
      state.nodes.get(data.name)?.g.classList.add("found");
      select(data.name);
      ensureVisible(data.name);
      showBubble(data.name, `encontrado · ${data.phone}`, "ok");
      shock(data.name, "var(--ok)");
      confettiAt(data.name);
      toast("success", `${data.name} encontrado`, `${data.phone} · ${data.role || "sin rol"} · ${result.steps} comparaciones`);
      log("ok", `${data.name} → ${data.phone} (${data.role || "sin rol"})`);
    } else {
      const last = result.comparisons[result.comparisons.length - 1];
      if (last) showBubble(last.node, `${name}: no encontrado`, "bad");
      shake();
      toast("error", "No encontrado", `"${name}" no está en el directorio`);
      log("err", `${name} no encontrado tras ${result.comparisons.length} comparaciones`);
    }
  });
}

function runInsert(payload) {
  return guarded(async () => {
    stopTraversal(true);
    clearMarks();
    const response = await api("/api/insert", payload);
    const result = response.result;
    const created = result.action === "created";
    log(created ? "insert" : "update", `${created ? "Insertando" : "Actualizando"} a ${result.name} (${payload.phone})`);
    await walkComparisons(result.comparisons, result.name);
    if (created && result.parent) {
      showBubble(result.parent, `${result.name} → hijo ${result.side === "left" ? "izquierdo" : "derecho"}`, "info");
      await sleep(stepMs() * 0.7);
    }
    hideBubble();
    clearMarks();
    render(response.tree);
    setMetrics(response.metrics);
    state.nodes.get(result.name)?.g.classList.add("found");
    shock(result.name, created ? "var(--ok)" : "var(--branch)");
    select(result.name);
    ensureVisible(result.name);
    setPath(result.directions);
    if (created) {
      toast("success", "Desarrollador insertado", `${result.name} quedó en el nivel ${result.level}`);
      log("ok", `${result.name} insertado en nivel ${result.level}${result.parent ? ` como hijo ${result.side === "left" ? "izquierdo" : "derecho"} de ${result.parent}` : " como raíz"}`);
    } else {
      toast("info", "Teléfono actualizado", `${result.name} ya existía: se actualizaron sus datos`);
      log("ok", `${result.name} ya existía → teléfono actualizado a ${payload.phone}`);
    }
    if (!response.metrics.avl_balanced) log("avl", `Desbalance en ${response.metrics.unbalanced_node}: el árbol no cumple AVL (prueba Rebalancear)`);
    $("#fName").value = "";
    $("#fPhone").value = "";
    $("#fStack").value = "";
  });
}

function runUpdate(payload) {
  return guarded(async () => {
    stopTraversal(true);
    clearMarks();
    const response = await api("/api/update", payload);
    render(response.tree);
    setMetrics(response.metrics);
    const name = response.result.name;
    state.nodes.get(name)?.g.classList.add("found");
    select(name);
    ensureVisible(name);
    showBubble(name, `actualizado · ${response.result.phone}`, "ok");
    shock(name, "var(--branch)");
    setPath(["root", "…", name, "updated"]);
    toast("success", "Datos actualizados", `${name} · ${response.result.phone}`);
    log("update", `${name} actualizado: ${response.result.phone} · ${response.result.role || "sin rol"}`);
  });
}

function runDelete(raw) {
  const name = String(raw || "").trim().replace(/\s+/g, " ");
  if (!name) {
    fieldError($("#delName"), "Escribe un nombre");
    return;
  }
  return guarded(async () => {
    stopTraversal(true);
    clearMarks();
    const response = await api("/api/delete", { name });
    const result = response.result;
    log("delete", `Eliminando a ${result.name}`);
    await walkComparisons(result.comparisons, result.name);
    state.nodes.get(result.name)?.g.classList.add("doomed");
    let summary = "";
    if (result.case === "leaf") {
      summary = `${result.name} es hoja: se elimina directamente`;
      showCase(`<b>Caso 1</b><span>Hoja · se elimina sin reacomodar</span>`);
      showBubble(result.name, "hoja → eliminar", "bad");
      await sleep(stepMs());
    } else if (result.case === "one_child") {
      summary = `${result.name} tiene un hijo: ${result.child} sube a su lugar`;
      showCase(`<b>Caso 2</b><span>Un hijo · ${esc(result.child)} ocupa su lugar</span>`);
      state.nodes.get(result.child)?.g.classList.add("successor");
      showBubble(result.child, `${result.child} sube`, "info");
      await sleep(stepMs());
    } else {
      summary = `${result.name} tiene dos hijos: lo reemplaza su sucesor inorden ${result.successor}`;
      showCase(`<b>Caso 3</b><span>Dos hijos · sucesor inorden = mínimo del subárbol derecho</span>`);
      await sleep(stepMs() * 0.6);
      for (let i = 0; i < result.successor_path.length; i++) {
        const step = result.successor_path[i];
        const rec = state.nodes.get(step);
        if (rec) rec.g.classList.add("visit");
        state.edges.get(step)?.path.classList.add("hot");
        const isLast = i === result.successor_path.length - 1;
        showBubble(step, i === 0 ? `${step} → derecha` : isLast ? `${step}: sin hijo izquierdo` : `${step} → izquierda`, "info");
        log("step", i === 0 ? `subárbol derecho de ${result.name}: ${step}` : `bajar a la izquierda: ${step}`);
        await sleep(stepMs() * 0.8);
      }
      state.nodes.get(result.successor)?.g.classList.add("successor");
      showBubble(result.successor, `sucesor ${result.successor} → reemplaza a ${result.name}`, "ok");
      await sleep(stepMs() * 1.1);
    }
    hideBubble();
    shock(result.name, "var(--danger)");
    render(response.tree, 900);
    setMetrics(response.metrics);
    clearMarks();
    const moved = result.successor || result.child;
    if (moved) state.nodes.get(moved)?.g.classList.add("found");
    setPath(result.directions);
    toast("success", `${result.name} eliminado`, summary);
    log("ok", summary);
    $("#delName").value = "";
    if (!response.metrics.empty && !response.metrics.avl_balanced) log("avl", `Desbalance en ${response.metrics.unbalanced_node}`);
    setTimeout(() => {
      if (!state.busy) $("#caseBanner").classList.remove("show");
    }, 2600);
  });
}

function loadData(endpoint, body, describe) {
  return guarded(async () => {
    clearMarks();
    const response = await api(endpoint, body);
    render(response.tree, 950);
    setMetrics(response.metrics);
    select(null);
    fit(true);
    describe(response);
  });
}

function seed() {
  return loadData("/api/seed", {}, response => {
    setPath(["semilla", `peso ${response.metrics.weight}`, `altura ${response.metrics.height}`]);
    toast("success", "Semilla cargada", `${response.metrics.weight} desarrolladores en el árbol`);
    log("info", "Semilla: Jhonatan, Andrea, Carlos, Diana, Ivan + 10 desarrolladores");
    log("avl", "Jhonatan → Andrea → Carlos → Diana → Ivan forma una cadena sesgada a la derecha: el árbol no es AVL");
  });
}

function demoPerfect() {
  return loadData("/api/demo_perfect", {}, response => {
    setPath(["demo del PDF", "H", "D", "L", "B", "F", "J", "N", "…"]);
    toast("success", "Demo del PDF", "Árbol binario perfecto A–O · 4 niveles · peso 15");
    log("info", `Inserción H, D, L, B, F, J, N, A, C, E, G, I, K, M, O → altura ${response.metrics.height}, peso ${response.metrics.weight}, ${response.metrics.leaf_count} hojas`);
  });
}

function randomTree() {
  const input = $("#randomCount");
  const count = Math.max(1, Math.min(60, parseInt(input.value, 10) || 12));
  input.value = count;
  return loadData("/api/random", { count }, response => {
    setPath(["aleatorio", `${count} nodos`, `altura ${response.metrics.height}`]);
    toast("success", "Árbol aleatorio", `${count} desarrolladores · altura ${response.metrics.height}`);
    log("info", `Aleatorio: ${count} desarrolladores · AVL ${response.metrics.avl_balanced ? "sí" : "no"}`);
  });
}

function rebalance() {
  if (!state.tree) {
    toast("info", "Árbol vacío", "No hay nada que rebalancear");
    return;
  }
  return guarded(async () => {
    clearMarks();
    const response = await api("/api/rebalance", {});
    const before = response.before;
    render(response.tree, 1100);
    setMetrics(response.metrics);
    fit(true);
    if (!reduced()) {
      for (const [name, p] of state.layout) setTimeout(() => shock(name, "var(--accent2)"), 500 + p.node.level * 110);
    }
    setPath(["recorrido inorden", "mediana como raíz", "reconstruir"]);
    toast("success", "Árbol rebalanceado", `Altura ${before.height} → ${response.metrics.height} · AVL: ${response.metrics.avl_balanced ? "sí" : "no"}`);
    log("avl", `Rebalanceo por mediana sobre el recorrido inorden: altura ${before.height} → ${response.metrics.height}, AVL ${response.metrics.avl_balanced ? "sí" : "no"}`);
  });
}

function clearTree() {
  return loadData("/api/clear", {}, () => {
    setPath(["árbol vacío"]);
    toast("info", "Árbol vacío", "Se eliminaron todos los nodos");
    log("info", "Se vació el árbol: ya no hay raíz");
  });
}

async function loadTraversal(type) {
  const response = await api(`/api/traversal?type=${type}`);
  clearTravBadges();
  $("#resultChips").innerHTML = "";
  Object.assign(state.trav, { type, seq: response.sequence, i: 0 });
  log("trav", `${TRAV_LABELS[type]} · ${response.sequence.length} nodos`);
  updateTravUI();
}

function clearTravBadges() {
  for (const rec of state.nodes.values()) {
    rec.g.classList.remove("tvisit", "badged", "tcur");
    rec.badgeText.textContent = "";
  }
}

function travStep() {
  const trav = state.trav;
  if (trav.i >= trav.seq.length) return false;
  const name = trav.seq[trav.i];
  if (trav.i > 0) travel(trav.seq[trav.i - 1], name, Math.min(480, stepMs() * 0.6));
  trav.i += 1;
  for (const rec of state.nodes.values()) rec.g.classList.remove("tcur");
  const rec = state.nodes.get(name);
  if (rec) {
    rec.badgeText.textContent = trav.i;
    rec.g.classList.add("tvisit", "badged", "tcur");
  }
  const chip = html("span", "rchip");
  chip.appendChild(html("i", "", trav.i));
  chip.appendChild(document.createTextNode(name));
  $("#resultChips").appendChild(chip);
  chip.scrollIntoView({ block: "nearest", inline: "nearest" });
  if (trav.i >= trav.seq.length) {
    log("ok", `${TRAV_LABELS[trav.type]}: ${trav.seq.join(" → ")}`);
    setPath([TRAV_LABELS[trav.type], ...trav.seq]);
  }
  updateTravUI();
  return true;
}

function updateTravUI() {
  const trav = state.trav;
  const play = $("#btnPlay");
  play.classList.toggle("playing", trav.playing);
  play.setAttribute("aria-label", trav.playing ? "Pausar recorrido" : "Reproducir recorrido");
  $$("#travTypes .seg-btn").forEach(btn => {
    const on = btn.dataset.trav === trav.type;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on);
  });
  const total = trav.seq.length;
  let status = "Listo para iniciar";
  if (total && trav.i >= total) status = `Completado · ${total} nodos`;
  else if (total && trav.i > 0) status = `${trav.playing ? "Reproduciendo" : "En pausa"} · paso ${trav.i}/${total}`;
  $("#travStatus").textContent = `${TRAV_LABELS[trav.type]} · ${status}`;
  $("#travHint").textContent = TRAV_HINTS[trav.type];
  $("#travProgress").style.width = total ? `${(trav.i / total) * 100}%` : "0%";
}

function stopTraversal(reset) {
  const trav = state.trav;
  clearTimeout(trav.timer);
  trav.playing = false;
  if (reset) {
    trav.seq = [];
    trav.i = 0;
    clearTravBadges();
    $("#resultChips").innerHTML = "";
  }
  updateTravUI();
}

async function ensureTraversal() {
  const trav = state.trav;
  if (!state.tree) {
    toast("info", "Árbol vacío", "Carga la semilla o inserta desarrolladores");
    return false;
  }
  if (!trav.seq.length || trav.i >= trav.seq.length) {
    try {
      clearMarks();
      await loadTraversal(trav.type);
    } catch (error) {
      reportError(error);
      return false;
    }
  }
  return true;
}

async function togglePlay() {
  const trav = state.trav;
  if (trav.playing) {
    clearTimeout(trav.timer);
    trav.playing = false;
    updateTravUI();
    return;
  }
  if (state.busy) return;
  if (!(await ensureTraversal())) return;
  trav.playing = true;
  updateTravUI();
  const tick = () => {
    if (!trav.playing) return;
    travStep();
    if (trav.i < trav.seq.length) trav.timer = setTimeout(tick, stepMs());
    else {
      trav.playing = false;
      updateTravUI();
    }
  };
  tick();
}

async function stepTraversal() {
  const trav = state.trav;
  if (state.busy) return;
  if (trav.playing) {
    clearTimeout(trav.timer);
    trav.playing = false;
  }
  if (!(await ensureTraversal())) return;
  travStep();
}

function chooseTraversal(type) {
  stopTraversal(true);
  state.trav.type = type;
  updateTravUI();
  togglePlay();
}

function theoryTargets(key) {
  const layout = state.layout;
  const metrics = state.metrics || {};
  const nodes = new Set();
  const edges = new Set();
  const badges = new Map();
  let band = 0;
  const sel = state.selected ? layout.get(state.selected) : null;
  const all = [...layout.entries()];
  switch (key) {
    case "root":
      if (metrics.root) nodes.add(metrics.root);
      break;
    case "node":
      all.forEach(([name]) => nodes.add(name));
      break;
    case "parent":
      all.forEach(([name, p]) => {
        if (p.node.degree > 0) {
          nodes.add(name);
          badges.set(name, p.node.degree);
        }
      });
      break;
    case "child":
      all.forEach(([name, p]) => {
        if (p.parent) {
          nodes.add(name);
          edges.add(name);
        }
      });
      break;
    case "sibling":
      if (sel && sel.parent) {
        const parent = layout.get(sel.parent).node;
        [parent.left, parent.right].forEach(c => c && nodes.add(c.name));
      } else {
        all.forEach(([, p]) => {
          if (p.node.left && p.node.right) {
            nodes.add(p.node.left.name);
            nodes.add(p.node.right.name);
          }
        });
      }
      break;
    case "leaf":
      (metrics.leaves || []).forEach(name => nodes.add(name));
      break;
    case "branch":
      (metrics.branches || []).forEach(name => nodes.add(name));
      break;
    case "height":
      (metrics.longest_path || []).forEach((name, i) => {
        nodes.add(name);
        badges.set(name, i + 1);
        if (i) edges.add(name);
      });
      break;
    case "level": {
      band = sel ? sel.node.level : state.levels;
      all.forEach(([name, p]) => {
        if (p.node.level === band) nodes.add(name);
      });
      break;
    }
    case "weight":
      all.slice().sort((a, b) => a[1].y - b[1].y || a[1].x - b[1].x).forEach(([name], i) => {
        nodes.add(name);
        badges.set(name, i + 1);
      });
      break;
    case "order":
      all.forEach(([name, p]) => {
        if (p.node.degree === 2) nodes.add(name);
      });
      break;
    case "degree":
      all.forEach(([name, p]) => badges.set(name, p.node.degree));
      if (sel) nodes.add(state.selected);
      else all.forEach(([name]) => nodes.add(name));
      break;
    default:
      break;
  }
  return { nodes, edges, badges, band };
}

function clearTheory() {
  for (const rec of state.nodes.values()) {
    rec.g.classList.remove("hl", "tbadged");
    rec.tbText.textContent = "";
  }
  for (const edge of state.edges.values()) edge.path.classList.remove("hl");
  $$("#bands .band-row").forEach(row => row.classList.remove("hl"));
  $("#canvasWrap").classList.remove("theory-on");
}

function applyTheory(key) {
  clearTheory();
  state.theory.active = key;
  $$(".gcard").forEach(card => card.classList.toggle("previewing", card.dataset.key === key));
  if (!key || !state.tree) return;
  const targets = theoryTargets(key);
  for (const name of targets.nodes) state.nodes.get(name)?.g.classList.add("hl");
  for (const name of targets.edges) state.edges.get(name)?.path.classList.add("hl");
  for (const [name, value] of targets.badges) {
    const rec = state.nodes.get(name);
    if (rec) {
      rec.tbText.textContent = value;
      rec.g.classList.add("tbadged");
    }
  }
  if (targets.band) $$("#bands .band-row")[targets.band - 1]?.classList.add("hl");
  $("#canvasWrap").classList.toggle("theory-on", targets.nodes.size > 0);
}

function glossaryValue(key) {
  const m = state.metrics;
  if (!m || m.empty) return key === "order" ? "2" : "—";
  const sel = state.selected ? nodeInfo(state.selected) : null;
  const parents = [...state.layout.values()].filter(p => p.node.degree > 0).length;
  switch (key) {
    case "root": return m.root;
    case "node": return `${m.weight}`;
    case "parent": return `${parents}`;
    case "child": return `${m.weight - 1}`;
    case "sibling": return sel ? (sel.siblings.length ? sel.siblings.join(", ") : "sin hermano") : "pares";
    case "leaf": return `${m.leaf_count}`;
    case "branch": return `${m.branch_count}`;
    case "height": return `${m.height} niveles`;
    case "level": return sel ? `${sel.name}: ${sel.level}` : `1…${m.height}`;
    case "weight": return `${m.weight} nodos`;
    case "order": return `${m.order}`;
    case "degree": return sel ? `${sel.name}: ${sel.degree}` : "0 · 1 · 2";
    default: return "";
  }
}

function renderGlossary() {
  const box = $("#glossary");
  box.innerHTML = "";
  for (const item of GLOSSARY) {
    const card = html("button", "gcard");
    card.type = "button";
    card.dataset.key = item.key;
    card.setAttribute("aria-pressed", "false");
    card.innerHTML = `<span class="gtop"><b></b><span class="gval"></span></span><p></p>`;
    $("b", card).textContent = item.title;
    $("p", card).textContent = item.def;
    card.setAttribute("aria-label", `${item.title}: ${item.def}`);
    card.addEventListener("mouseenter", () => applyTheory(item.key));
    card.addEventListener("focus", () => applyTheory(item.key));
    card.addEventListener("mouseleave", () => applyTheory(state.theory.pinned));
    card.addEventListener("blur", () => applyTheory(state.theory.pinned));
    card.addEventListener("click", () => {
      state.theory.pinned = state.theory.pinned === item.key ? null : item.key;
      $$(".gcard").forEach(c => c.setAttribute("aria-pressed", c.dataset.key === state.theory.pinned));
      applyTheory(state.theory.pinned || item.key);
      if (state.theory.pinned) log("theory", `${item.title}: ${item.def} → ${glossaryValue(item.key)}`);
    });
    box.appendChild(card);
  }
  refreshGlossary();
}

function refreshGlossary() {
  $$(".gcard").forEach(card => {
    const value = glossaryValue(card.dataset.key);
    const el = $(".gval", card);
    el.textContent = value;
    el.title = value;
  });
}

function renderTypes() {
  const box = $("#types");
  box.innerHTML = "";
  for (const type of TREE_TYPES) {
    const card = html("article", "tcard");
    card.innerHTML = `
      <div class="ticon" aria-hidden="true"><svg viewBox="0 0 44 36">${TYPE_ICONS[type.icon]}</svg></div>
      <div>
        <h4>${esc(type.name)}${type.tag ? ` <span class="pill">${esc(type.tag)}</span>` : ""}</h4>
        <p>${esc(type.desc)}</p>
        <div class="use"><b>Uso:</b> ${esc(type.use)}</div>
      </div>`;
    box.appendChild(card);
  }
}

function renderPerfectPreview() {
  const box = $("#perfectPreview");
  box.innerHTML = "";
  const letters = "ABCDEFGHIJKLMNO".split("");
  const positions = new Map();
  const build = (low, high, level) => {
    if (low > high) return null;
    const mid = Math.floor((low + high) / 2);
    positions.set(letters[mid], { x: 34 + mid * 19.5, y: 18 + (level - 1) * 36, level });
    const left = build(low, mid - 1, level + 1);
    const right = build(mid + 1, high, level + 1);
    return { name: letters[mid], left, right };
  };
  const root = build(0, letters.length - 1, 1);
  for (let level = 1; level <= 4; level++) {
    if (level % 2) svg("rect", { class: "pv-band", x: 0, y: 18 + (level - 1) * 36 - 18, width: 320, height: 36 }, box);
    const text = svg("text", { class: "pv-level", x: 2, y: 18 + (level - 1) * 36 + 3 }, box);
    text.textContent = `N${level}`;
  }
  const drawEdges = node => {
    if (!node) return;
    for (const child of [node.left, node.right]) {
      if (!child) continue;
      const a = positions.get(node.name);
      const b = positions.get(child.name);
      svg("path", { class: "pv-edge", d: `M${a.x},${a.y} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y}` }, box);
      drawEdges(child);
    }
  };
  drawEdges(root);
  for (const [letter, p] of positions) {
    const fill = p.level === 1 ? "url(#gRoot)" : p.level === 4 ? "url(#gLeaf)" : "url(#gBranch)";
    svg("circle", { cx: p.x, cy: p.y, r: 8.5, fill, stroke: "rgba(255,255,255,.5)", "stroke-width": 0.8 }, box);
    const text = svg("text", { x: p.x, y: p.y + 3.4 }, box);
    text.textContent = letter;
  }
}

function renderMini(tree) {
  const box = $("#miniTree");
  box.innerHTML = "";
  if (!tree) {
    box.setAttribute("viewBox", "0 0 300 160");
    return;
  }
  const items = [];
  let index = 0;
  const walk = (node, parent) => {
    if (!node) return;
    walk(node.left, node);
    items.push({ node, parent, x: index++ * 40, y: (node.level - 1) * 50 });
    walk(node.right, node);
  };
  walk(tree, null);
  const byId = new Map(items.map(item => [item.node.id, item]));
  const maxX = Math.max(...items.map(item => item.x));
  const maxY = Math.max(...items.map(item => item.y));
  const width = Math.max(maxX + 60, 240);
  const height = Math.max(maxY + 56, 150);
  box.setAttribute("viewBox", `${-30 - (width - maxX - 60) / 2} -26 ${width} ${height}`);
  for (const item of items) {
    if (!item.parent) continue;
    const p = byId.get(item.parent.id);
    const y1 = p.y + 15;
    const y2 = item.y - 15;
    svg("path", { class: "medge", d: `M${p.x},${y1} C${p.x},${(y1 + y2) / 2} ${item.x},${(y1 + y2) / 2} ${item.x},${y2}` }, box);
  }
  for (const item of items) {
    const g = svg("g", { class: `mnode t-${item.node.type}`, transform: `translate(${item.x},${item.y})` }, box);
    g.dataset.id = item.node.id;
    const inner = svg("g", {}, g);
    if (!state.numKnown.has(item.node.id)) {
      inner.setAttribute("class", "mnode entering");
      state.numKnown.add(item.node.id);
    }
    svg("circle", { class: "mhalo", r: 22 }, inner);
    svg("circle", { class: "core", r: 15 }, inner);
    const text = svg("text", { y: 4.2 }, inner);
    text.textContent = item.node.value;
  }
}

function renderNumbers(response) {
  if (!response.tree) state.numKnown.clear();
  renderMini(response.tree);
  $("#numEmpty").hidden = Boolean(response.tree);
  $("#numCount").textContent = response.count;
  const insertion = $("#numInsertion");
  insertion.innerHTML = "";
  response.insertion.forEach(value => insertion.appendChild(html("span", "chip static", value)));
}

async function numbersRefresh(order = "asc") {
  const response = await api(`/api/numbers/sorted?order=${order}`);
  renderNumbers(response);
  return response;
}

function numbersPlay(order) {
  return guarded(async () => {
    const response = await numbersRefresh(order);
    const chips = $("#numChips");
    chips.innerHTML = "";
    $("#numPrinted").textContent = "—";
    const label = order === "asc" ? "Inorden ascendente" : "Inorden descendente";
    $("#numResultLabel").textContent = label;
    if (!response.tree) {
      toast("info", "Sin números", "Agrega números o usa el ejemplo del PDF");
      return;
    }
    log("num", `Recorrido ${label.toLowerCase()} del árbol de números`);
    for (const item of response.sequence) {
      $$("#miniTree .mnode.on").forEach(g => {
        g.classList.remove("on");
        g.classList.add("done");
      });
      $(`#miniTree .mnode[data-id="${item.id}"]`)?.classList.add("on");
      chips.appendChild(html("span", "chip static", item.value));
      await sleep(Math.max(180, stepMs() * 0.7));
    }
    $$("#miniTree .mnode.on").forEach(g => {
      g.classList.remove("on");
      g.classList.add("done");
    });
    $("#numPrinted").textContent = response.values.join(" ");
    log("ok", `Salida: ${response.values.join(" ")}`);
    setPath(["números", label.toLowerCase(), ...response.values.map(String)]);
  });
}

function numbersAdd(raw) {
  const input = $("#numInput");
  const parts = String(raw).split(/[\s,;]+/).filter(Boolean);
  if (!parts.length) {
    fieldError(input, "Escribe uno o más enteros");
    return;
  }
  if (parts.some(part => !/^-?\d{1,3}$/.test(part))) {
    fieldError(input, "Solo enteros entre -999 y 999");
    return;
  }
  clearFieldError(input);
  const values = parts.map(Number);
  return guarded(async () => {
    const response = await api("/api/numbers/add", { values });
    renderNumbers(response);
    $("#numChips").innerHTML = "";
    $("#numPrinted").textContent = "—";
    input.value = "";
    log("num", `Agregados ${values.join(", ")}: cada valor baja a la izquierda si es menor y a la derecha si es mayor o igual`);
    toast("success", "Números agregados", values.join(", "));
  });
}

async function numbersExample() {
  await guarded(async () => {
    const response = await api("/api/numbers/example", {});
    state.numKnown.clear();
    renderNumbers(response);
    log("num", "Ejemplo del PDF: se insertan 5, 2, 7, 1, 3, 6, 8");
  });
  await numbersPlay("asc");
}

function numbersClear() {
  return guarded(async () => {
    const response = await api("/api/numbers/clear", {});
    renderNumbers(response);
    $("#numChips").innerHTML = "";
    $("#numPrinted").textContent = "—";
    log("num", "Árbol de enteros vacío");
  });
}

function runCompare(raw) {
  const input = $("#cmpName");
  const name = String(raw || "").trim().replace(/\s+/g, " ");
  if (!name) {
    fieldError(input, "Escribe un nombre");
    return;
  }
  clearFieldError(input);
  return guarded(async () => {
    const response = await api(`/api/compare?name=${encodeURIComponent(name)}`);
    const list = response.list;
    const tree = response.tree;
    const max = Math.max(list.steps, tree.steps, 1);
    const listSeq = $("#cmpListSeq");
    const treeSeq = $("#cmpTreeSeq");
    listSeq.innerHTML = "";
    treeSeq.innerHTML = "";
    $("#barList").style.width = "0%";
    $("#barTree").style.width = "0%";
    $("#cntList").textContent = "0";
    $("#cntTree").textContent = "0";
    $("#cmpVerdict").textContent = "";
    clearMarks();
    applyTheory(null);
    for (let s = 1; s <= max; s++) {
      if (s <= list.steps) {
        $("#barList").style.width = `${(s / max) * 100}%`;
        $("#cntList").textContent = s;
        const chip = html("span", "", list.sequence[s - 1]);
        if (list.found && s === list.steps) chip.classList.add("hit");
        listSeq.appendChild(chip);
      }
      if (s <= tree.steps) {
        $("#barTree").style.width = `${(s / max) * 100}%`;
        $("#cntTree").textContent = s;
        const nodeName = tree.path[s - 1];
        const chip = html("span", "", nodeName);
        if (tree.found && s === tree.steps) chip.classList.add("hit");
        treeSeq.appendChild(chip);
        state.nodes.get(nodeName)?.g.classList.add("visit");
        if (s > 1) state.edges.get(nodeName)?.path.classList.add("hot");
      }
      await sleep(Math.max(70, stepMs() / 3));
    }
    const verdict = $("#cmpVerdict");
    if (tree.found) {
      state.nodes.get(tree.path[tree.path.length - 1])?.g.classList.add("found");
      const saved = list.steps - tree.steps;
      verdict.innerHTML = `Árbol: <b>${tree.steps}</b> pasos · Lista: <b>${list.steps}</b> pasos · ${saved > 0 ? `el árbol ahorra ${saved}` : saved === 0 ? "empate" : `la lista gana por ${-saved}`} (n = ${response.weight}).`;
    } else {
      verdict.innerHTML = `${esc(name)} no existe: la lista revisó <b>${list.steps}</b> elementos y el árbol solo <b>${tree.steps}</b>.`;
    }
    log("info", `Comparación "${name}": lista ${list.steps} pasos vs árbol ${tree.steps} pasos`);
  });
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = html("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJSON() {
  if (!state.tree) {
    toast("info", "Nada que exportar", "El árbol está vacío");
    return;
  }
  const payload = { exported_at: new Date().toISOString(), metrics: state.metrics, tree: state.tree };
  download(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), "treelab-arbol.json");
  toast("success", "JSON exportado", "treelab-arbol.json");
  log("info", "Exportado treelab-arbol.json");
}

function exportSVG() {
  const bounds = layoutBounds();
  if (!bounds) {
    toast("info", "Nada que exportar", "El árbol está vacío");
    return;
  }
  const dark = document.documentElement.dataset.theme !== "light";
  const pad = 24;
  const gutter = 80;
  const width = Math.ceil(bounds.maxX - bounds.minX + pad * 2 + gutter);
  const height = Math.ceil(bounds.maxY - bounds.minY + pad * 2);
  const ox = pad + gutter - bounds.minX;
  const oy = pad - bounds.minY;
  const colors = { root: ["#ffd59a", "#ff9f1c", "#c96400"], branch: ["#e2f2ff", "#7cc4ff", "#2f7fd0"], leaf: ["#d9f8d0", "#7ddc6b", "#349a26"] };
  const text = dark ? "#e8ecff" : "#121a36";
  const bg = dark ? "#0b1020" : "#f3f5fc";
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  parts.push("<defs>");
  for (const [type, [a, b, c]] of Object.entries(colors)) {
    parts.push(`<radialGradient id="g-${type}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${a}"/><stop offset=".45" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`);
  }
  parts.push("</defs>");
  parts.push(`<rect width="100%" height="100%" fill="${bg}"/>`);
  for (let level = 1; level <= state.levels; level++) {
    const cy = oy + (level - 1) * GAP_Y;
    if (level % 2) parts.push(`<rect x="0" y="${cy - GAP_Y / 2}" width="${width}" height="${GAP_Y}" fill="${dark ? "rgba(255,255,255,.03)" : "rgba(20,30,70,.03)"}"/>`);
    parts.push(`<text x="16" y="${cy + 4}" font-family="ui-monospace, Menlo, monospace" font-size="11" font-weight="700" fill="${dark ? "#9aa6c8" : "#56617f"}">Nivel ${level}</text>`);
  }
  for (const p of state.layout.values()) {
    if (!p.parent) continue;
    const q = state.layout.get(p.parent);
    parts.push(`<path d="${edgePath({ x: q.x + ox, y: q.y + oy }, { x: p.x + ox, y: p.y + oy })}" fill="none" stroke="${dark ? "rgba(160,178,255,.45)" : "rgba(70,90,170,.45)"}" stroke-width="2"/>`);
  }
  for (const p of state.layout.values()) {
    const x = p.x + ox;
    const y = p.y + oy;
    parts.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="url(#g-${p.node.type})" stroke="rgba(255,255,255,.5)"/>`);
    parts.push(`<text x="${x}" y="${y + 4.5}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#0b1020">${esc(initials(p.node.name))}</text>`);
    parts.push(`<text x="${x}" y="${y + R + 19}" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="12" font-weight="700" fill="${text}">${esc(shortLabel(p.node.name))}</text>`);
  }
  parts.push("</svg>");
  download(new Blob([parts.join("")], { type: "image/svg+xml" }), "treelab-arbol.svg");
  toast("success", "SVG exportado", "treelab-arbol.svg");
  log("info", "Exportado treelab-arbol.svg");
}

function updateDatalist() {
  const list = $("#namesList");
  list.innerHTML = "";
  for (const name of [...state.layout.keys()].sort((a, b) => a.localeCompare(b, "es"))) {
    const option = document.createElement("option");
    option.value = name;
    list.appendChild(option);
  }
}

function switchTab(id) {
  $$(".tab").forEach((tab, i) => {
    const on = tab.dataset.tab === id;
    tab.setAttribute("aria-selected", on);
    tab.tabIndex = on ? 0 : -1;
    if (on) $(".tab-ind").style.transform = `translateX(${i * 100}%)`;
  });
  $$(".tabpanel").forEach(panel => {
    panel.hidden = panel.id !== `tab-${id}`;
  });
  if (id !== "theory") {
    state.theory.pinned = null;
    $$(".gcard").forEach(c => c.setAttribute("aria-pressed", "false"));
    applyTheory(null);
  }
}

function openSheet() {
  if (mobileQuery.matches) document.body.classList.add("sheet-open");
}

function toggleSidebar() {
  if (mobileQuery.matches) document.body.classList.toggle("sheet-open");
  else {
    document.body.classList.toggle("sidebar-collapsed");
    setTimeout(() => fit(true), reduced() ? 0 : 480);
  }
}

function setTheme(theme, persist) {
  const root = document.documentElement;
  if (persist && !reduced()) {
    root.classList.add("theme-anim");
    setTimeout(() => root.classList.remove("theme-anim"), 650);
  }
  root.dataset.theme = theme;
  if (persist) {
    try {
      localStorage.setItem("treelab-theme", theme);
    } catch (error) {
      log("info", "Preferencia de tema no guardada");
    }
  }
  $("#btnTheme").setAttribute("aria-label", theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next, true);
  toast("info", next === "dark" ? "Tema oscuro" : "Tema claro", "Presiona t para alternar");
}

function setSpeed(value) {
  state.speed = Math.max(1, Math.min(5, Number(value) || 3));
  $("#speed").value = state.speed;
  $("#speedOut").textContent = SPEED_LABELS[state.speed - 1];
}

function bindCanvas() {
  const canvas = $("#canvas");
  canvas.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    cancelAnimationFrame(state.viewRaf);
    state.drag = { id: event.pointerId, sx: event.clientX, sy: event.clientY, vx: state.view.x, vy: state.view.y, moved: false };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", event => {
    const drag = state.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.sx;
    const dy = event.clientY - drag.sy;
    if (Math.hypot(dx, dy) > 3) drag.moved = true;
    state.view.x = drag.vx + dx;
    state.view.y = drag.vy + dy;
    applyView();
  });
  const end = event => {
    const drag = state.drag;
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved && event.type === "pointerup") select(null);
    state.drag = null;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("wheel", event => {
    event.preventDefault();
    cancelAnimationFrame(state.viewRaf);
    const rect = canvas.getBoundingClientRect();
    zoomAt(event.clientX - rect.left, event.clientY - rect.top, Math.exp(-event.deltaY * 0.0016));
  }, { passive: false });
  $("#zoomIn").addEventListener("click", () => zoomAt(state.wrap.w / 2, state.wrap.h / 2, 1.25));
  $("#zoomOut").addEventListener("click", () => zoomAt(state.wrap.w / 2, state.wrap.h / 2, 0.8));
  $("#zoomFit").addEventListener("click", () => fit(true));
  $("#minimap").addEventListener("pointerdown", event => {
    event.stopPropagation();
    if (!state.mm) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / rect.width) * state.mm.W;
    const my = ((event.clientY - rect.top) / rect.height) * state.mm.H;
    const wx = (mx - state.mm.ox) / state.mm.s;
    const wy = (my - state.mm.oy) / state.mm.s;
    const k = state.view.k;
    animateView({ k, x: state.wrap.w / 2 - wx * k, y: state.wrap.h / 2 - wy * k }, 380);
  });
  const observer = new ResizeObserver(entries => {
    const rect = entries[0].contentRect;
    state.wrap = { w: rect.width, h: rect.height };
    updateBands();
    updateMinimapView();
  });
  observer.observe($("#canvasWrap"));
  const rect = $("#canvasWrap").getBoundingClientRect();
  state.wrap = { w: rect.width, h: rect.height };
}

function bindForms() {
  $("#formSearch").addEventListener("submit", event => {
    event.preventDefault();
    const name = validName($("#searchName"));
    if (name) runSearch(name);
  });
  $$("[data-quick]").forEach(chip => chip.addEventListener("click", () => {
    $("#searchName").value = chip.dataset.quick;
    clearFieldError($("#searchName"));
    runSearch(chip.dataset.quick);
  }));
  $("#formUpsert").addEventListener("submit", event => {
    event.preventDefault();
    const name = validName($("#fName"));
    if (!name) return;
    const phone = validPhone($("#fPhone"), true);
    if (!phone) return;
    runInsert({ name, phone, role: $("#fRole").value, stack: parseStack($("#fStack").value) });
  });
  $("#btnUpdate").addEventListener("click", () => {
    const name = validName($("#fName"));
    if (!name) return;
    const phone = validPhone($("#fPhone"), false);
    if (phone === null) return;
    const payload = { name, role: $("#fRole").value, stack: parseStack($("#fStack").value) };
    if (phone) payload.phone = phone;
    runUpdate(payload);
  });
  $("#formDelete").addEventListener("submit", event => {
    event.preventDefault();
    const name = validName($("#delName"));
    if (name) runDelete(name);
  });
  $$("input").forEach(input => input.addEventListener("input", () => clearFieldError(input)));
  $("#formNum").addEventListener("submit", event => {
    event.preventDefault();
    numbersAdd($("#numInput").value);
  });
  $("#formCompare").addEventListener("submit", event => {
    event.preventDefault();
    runCompare($("#cmpName").value);
  });
}

function bindButtons() {
  $$(".card.collapsible > .toggle").forEach(btn => btn.addEventListener("click", () => {
    const collapsed = btn.parentElement.classList.toggle("collapsed");
    btn.setAttribute("aria-expanded", String(!collapsed));
  }));
  $("#btnSeed").addEventListener("click", seed);
  $("#btnSeedEmpty").addEventListener("click", seed);
  $("#btnDemo").addEventListener("click", demoPerfect);
  $("#btnLoadPerfect").addEventListener("click", demoPerfect);
  $("#btnRandom").addEventListener("click", randomTree);
  $("#btnRebalance").addEventListener("click", rebalance);
  $("#btnClear").addEventListener("click", clearTree);
  $("#btnExportJson").addEventListener("click", exportJSON);
  $("#btnExportSvg").addEventListener("click", exportSVG);
  $("#btnPlay").addEventListener("click", togglePlay);
  $("#btnStep").addEventListener("click", stepTraversal);
  $("#btnReset").addEventListener("click", () => {
    stopTraversal(true);
    log("trav", "Recorrido reiniciado");
  });
  $$("#travTypes .seg-btn").forEach(btn => btn.addEventListener("click", () => chooseTraversal(btn.dataset.trav)));
  $("#btnNumExample").addEventListener("click", numbersExample);
  $("#btnNumClear").addEventListener("click", numbersClear);
  $("#btnAsc").addEventListener("click", () => numbersPlay("asc"));
  $("#btnDesc").addEventListener("click", () => numbersPlay("desc"));
  $("#btnClearLog").addEventListener("click", () => {
    $("#log").innerHTML = "";
  });
  $("#btnTheme").addEventListener("click", toggleTheme);
  $("#btnSidebar").addEventListener("click", toggleSidebar);
  $("#sheetHandle").addEventListener("click", () => document.body.classList.toggle("sheet-open"));
  $("#btnHelp").addEventListener("click", () => $("#helpDialog").showModal());
  $("#btnCloseHelp").addEventListener("click", () => $("#helpDialog").close());
  $("#speed").addEventListener("input", event => {
    setSpeed(event.target.value);
    try {
      localStorage.setItem("treelab-speed", state.speed);
    } catch (error) {
      state.speed = Number(event.target.value);
    }
  });
  $("#mAvl").addEventListener("click", () => {
    const m = state.metrics;
    if (!m || m.empty) return;
    if (m.unbalanced_node) {
      select(m.unbalanced_node);
      ensureVisible(m.unbalanced_node);
      showBubble(m.unbalanced_node, `FE = ${state.layout.get(m.unbalanced_node).node.balance_factor} → |FE| > 1`, "bad");
      log("avl", `${m.unbalanced_node} tiene factor de equilibrio ${state.layout.get(m.unbalanced_node).node.balance_factor}`);
    } else {
      toast("success", "Árbol AVL", "Todos los nodos cumplen |FE| ≤ 1");
    }
  });
  $$(".tab").forEach((tab, i, tabs) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    tab.addEventListener("keydown", event => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const next = tabs[(i + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      switchTab(next.dataset.tab);
      next.focus();
    });
  });
  document.addEventListener("pointerdown", event => {
    const target = event.target.closest(".btn, button.chip, .icon-btn, .seg-btn");
    if (!target || reduced()) return;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const ripple = html("span", "ripple");
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    target.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
}

function bindKeyboard() {
  document.addEventListener("keydown", event => {
    const tag = event.target.tagName;
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || event.target.isContentEditable;
    if (event.key === "Escape") {
      if (typing) event.target.blur();
      else {
        select(null);
        clearMarks();
        document.body.classList.remove("sheet-open");
      }
      return;
    }
    if (typing || event.ctrlKey || event.metaKey || event.altKey) return;
    if ($("#helpDialog").open) return;
    const onButton = tag === "BUTTON" || event.target.getAttribute("role") === "button";
    switch (event.key) {
      case "/":
        event.preventDefault();
        switchTab("dir");
        openSheet();
        expandCard("searchCard");
        $("#searchName").focus();
        $("#searchName").select();
        break;
      case "i":
        event.preventDefault();
        switchTab("dir");
        openSheet();
        expandCard("upsertCard");
        $("#fName").focus();
        break;
      case "d":
        event.preventDefault();
        switchTab("dir");
        openSheet();
        expandCard("deleteCard");
        if (state.selected) $("#delName").value = state.selected;
        $("#delName").focus();
        break;
      case " ":
        if (onButton) return;
        event.preventDefault();
        togglePlay();
        break;
      case "f":
        fit(true);
        break;
      case "t":
        toggleTheme();
        break;
      case "+":
      case "=":
        zoomAt(state.wrap.w / 2, state.wrap.h / 2, 1.2);
        break;
      case "-":
        zoomAt(state.wrap.w / 2, state.wrap.h / 2, 1 / 1.2);
        break;
      case "?":
        $("#helpDialog").showModal();
        break;
      default:
        break;
    }
  });
}

async function init() {
  setTheme(document.documentElement.dataset.theme || "dark", false);
  let savedSpeed = 3;
  try {
    savedSpeed = Number(localStorage.getItem("treelab-speed")) || 3;
  } catch (error) {
    savedSpeed = 3;
  }
  setSpeed(savedSpeed);
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", event => {
    let stored = null;
    try {
      stored = localStorage.getItem("treelab-theme");
    } catch (error) {
      stored = null;
    }
    if (!stored) setTheme(event.matches ? "light" : "dark", false);
  });
  bindCanvas();
  bindForms();
  bindButtons();
  bindKeyboard();
  renderGlossary();
  renderTypes();
  renderPerfectPreview();
  renderInspector();
  updateTravUI();
  log("info", "TreeLab · Árbol binario de búsqueda (clave = nombre, sin distinguir mayúsculas)");
  try {
    const [snapshot, numbers] = await Promise.all([api("/api/tree"), api("/api/numbers/sorted?order=asc")]);
    document.body.classList.remove("is-loading");
    render(snapshot.tree, 1000);
    setMetrics(snapshot.metrics);
    fit(false);
    renderNumbers(numbers);
    log("ok", `Directorio cargado: ${snapshot.metrics.weight} desarrolladores · altura ${snapshot.metrics.height}`);
    if (!snapshot.metrics.empty && !snapshot.metrics.avl_balanced) {
      log("avl", `Árbol sesgado: Jhonatan → Andrea → Carlos → Diana → Ivan. Desbalance en ${snapshot.metrics.unbalanced_node}`);
    }
    setPath(["root", snapshot.metrics.root || "vacío"]);
  } catch (error) {
    document.body.classList.remove("is-loading");
    render(null);
    reportError(error);
  }
}

document.addEventListener("DOMContentLoaded", init);
