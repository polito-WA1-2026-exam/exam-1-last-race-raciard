/**
 * Automatic subway map layout algorithm.
 *
 * Phases:
 *  1. Build adjacency graph + all-pairs BFS shortest paths
 *  2. Kamada-Kawai stress minimisation run from MULTIPLE starting positions;
 *     the result with the lowest total stress is kept.
 *     Seeds: standard circle, BFS-ordered circles from the two highest-degree
 *     nodes, and a BFS-tree grid layout.  This avoids bad local minima that
 *     the single-seed version could fall into.
 *  3. Line-straightening forces — interchange-aware: stations shared between
 *     N lines are pulled N× less aggressively so competing forces don't
 *     distort the layout.
 *  4. Minimum-separation pass — push overlapping stations apart.
 *  5. Normalise / centre to fit the target canvas.
 *
 * @param {Array<{id: number, name: string}>} stations
 * @param {Array<{id: number, name: string, stations: Array<{id: number, position: number}>}>} lines
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {{ [stationId: number]: {x: number, y: number} }}
 */
export function computeSubwayLayout(stations, lines, canvasWidth, canvasHeight) {
  if (!stations.length) return {};

  const ids = stations.map(s => s.id);
  const n = ids.length;
  const idxOf = {};
  ids.forEach((id, i) => { idxOf[id] = i; });

  // ── 1. Build adjacency + BFS distances ───────────────────────────────────
  const adj = Array.from({ length: n }, () => new Set());
  for (const line of lines) {
    const sorted = [...line.stations].sort((a, b) => a.position - b.position);
    for (let k = 0; k < sorted.length - 1; k++) {
      const a = idxOf[sorted[k].id];
      const b = idxOf[sorted[k + 1].id];
      if (a !== undefined && b !== undefined) {
        adj[a].add(b);
        adj[b].add(a);
      }
    }
  }

  const D = bfsAllPairs(n, adj);

  // Precompute spring constants and ideal lengths (shared across all seeds)
  const L0 = 1.0;
  const springK = [], springL = [];
  for (let i = 0; i < n; i++) {
    springK[i] = []; springL[i] = [];
    for (let j = 0; j < n; j++) {
      const d = D[i][j];
      springK[i][j] = d > 0 ? 1 / (d * d) : 0;
      springL[i][j] = L0 * d;
    }
  }

  // ── 2. Multiple-seed Kamada-Kawai; keep minimum-stress result ────────────
  // Seed variety is the key robustness fix: a plain circle places stations in
  // DB-insertion order, which has nothing to do with graph proximity and
  // forces K-K into a random local minimum.  BFS-ordered circles and grid
  // seeds put graph-close nodes near each other, yielding much better optima.
  const degrees = Array.from({ length: n }, (_, i) => adj[i].size);
  const byDeg   = [...Array(n).keys()].sort((a, b) => degrees[b] - degrees[a]);

  const seeds = [
    plainCircle(n),                                 // standard circle
    bfsCircle(n, adj, byDeg[0]),                    // BFS-ordered from top-degree
    bfsCircle(n, adj, byDeg[1] ?? byDeg[0]),        // BFS-ordered from 2nd-degree
    bfsGrid(n, adj, byDeg[0]),                      // grid layout from top-degree
  ];

  let bestPos = null, bestStress = Infinity;
  for (const seed of seeds) {
    const pos = kamadaKawai(seed.map(p => ({ ...p })), n, springK, springL);
    const stress = totalStress(pos, n, springK, springL);
    if (stress < bestStress) { bestStress = stress; bestPos = pos; }
  }

  const pos = bestPos;

  // ── 3. Line-straightening (interchange-aware) ─────────────────────────────
  // Count how many lines each station belongs to.  Interchange stations are
  // pulled with strength α/lineCount so competing forces cancel gracefully
  // instead of creating distorted shapes.
  const lineCounts = new Array(n).fill(0);
  for (const line of lines) {
    for (const s of line.stations) {
      const i = idxOf[s.id];
      if (i !== undefined) lineCounts[i]++;
    }
  }
  straightenLines(pos, lines, idxOf, lineCounts, 4, 0.12);

  // ── 4. Minimum-separation pass ────────────────────────────────────────────
  separateNodes(pos, n, 1.10);

  // ── 5. Normalise to canvas ────────────────────────────────────────────────
  return fitToCanvas(pos, ids, canvasWidth, canvasHeight, 0.12);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** All-pairs shortest path via BFS. Disconnected pairs receive distance n. */
function bfsAllPairs(n, adj) {
  const D = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) D[i][i] = 0;
  for (let src = 0; src < n; src++) {
    const queue = [src]; let qi = 0;
    while (qi < queue.length) {
      const cur = queue[qi++];
      for (const nb of adj[cur]) {
        if (D[src][nb] === Infinity) {
          D[src][nb] = D[src][cur] + 1;
          queue.push(nb);
        }
      }
    }
    for (let j = 0; j < n; j++) {
      if (D[src][j] === Infinity) D[src][j] = n;
    }
  }
  return D;
}

/** Stations placed at equal angles on a unit circle, in index order. */
function plainCircle(n) {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.cos((i / n) * 2 * Math.PI - Math.PI / 2),
    y: Math.sin((i / n) * 2 * Math.PI - Math.PI / 2),
  }));
}

/**
 * BFS-ordered circle: nodes are placed in BFS discovery order starting from
 * `root`, so graph-adjacent nodes are already near each other on the circle.
 * This dramatically reduces how much K-K must "untangle" the initial layout.
 */
function bfsCircle(n, adj, root) {
  const order = bfsOrder(n, adj, root);
  const pos = new Array(n);
  order.forEach((node, idx) => {
    const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
    pos[node] = { x: Math.cos(angle), y: Math.sin(angle) };
  });
  return pos;
}

/**
 * BFS-tree grid: layers of BFS from `root` become rows of a 2-D grid.
 * Gives K-K a starting position that already mirrors the graph's depth
 * structure, yielding a very different local minimum from the circle seeds.
 */
function bfsGrid(n, adj, root) {
  const layers = [];
  const visited = new Set([root]);
  let current = [root];
  while (current.length) {
    layers.push(current);
    const next = [];
    for (const node of current) {
      for (const nb of [...adj[node]].sort((a, b) => a - b)) {
        if (!visited.has(nb)) { visited.add(nb); next.push(nb); }
      }
    }
    current = next;
  }
  // Append any disconnected nodes to the last layer
  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) layers[layers.length - 1].push(i);
  }
  const pos = new Array(n);
  const nL = layers.length;
  layers.forEach((layer, li) => {
    const nInLayer = layer.length;
    layer.forEach((node, ni) => {
      pos[node] = {
        x: nInLayer > 1 ? (ni / (nInLayer - 1)) * 2 - 1 : 0,
        y: nL      > 1 ? (li / (nL      - 1)) * 2 - 1 : 0,
      };
    });
  });
  return pos;
}

/** BFS discovery order starting from `root`; disconnected nodes appended. */
function bfsOrder(n, adj, root) {
  const order = [];
  const visited = new Set([root]);
  const queue = [root]; let qi = 0;
  while (qi < queue.length) {
    const cur = queue[qi++];
    order.push(cur);
    for (const nb of [...adj[cur]].sort((a, b) => a - b)) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }
  for (let i = 0; i < n; i++) { if (!visited.has(i)) order.push(i); }
  return order;
}

/** Kamada-Kawai stress minimisation. Mutates `pos` in-place and returns it. */
function kamadaKawai(pos, n, K, L) {
  const KK_ITERS   = 400;
  const INNER_ITERS = 12;
  const EPSILON    = 1e-4;

  for (let iter = 0; iter < KK_ITERS; iter++) {
    let maxDelta = -1, maxM = 0;
    for (let m = 0; m < n; m++) {
      let dEx = 0, dEy = 0;
      for (let i = 0; i < n; i++) {
        if (i === m) continue;
        const dx = pos[m].x - pos[i].x;
        const dy = pos[m].y - pos[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1e-9;
        const f = K[m][i] * (1 - L[m][i] / dist);
        dEx += f * dx; dEy += f * dy;
      }
      const delta = Math.sqrt(dEx * dEx + dEy * dEy);
      if (delta > maxDelta) { maxDelta = delta; maxM = m; }
    }
    if (maxDelta < EPSILON) break;

    const m = maxM;
    for (let sub = 0; sub < INNER_ITERS; sub++) {
      let dEx = 0, dEy = 0, d2Ex = 0, d2Ey = 0, dExy = 0;
      for (let i = 0; i < n; i++) {
        if (i === m) continue;
        const dx = pos[m].x - pos[i].x;
        const dy = pos[m].y - pos[i].y;
        const dist2 = dx * dx + dy * dy;
        const dist  = Math.sqrt(dist2) || 1e-9;
        const dist3 = dist2 * dist;
        const k = K[m][i], l = L[m][i];
        dEx  += k * (dx - l * dx / dist);
        dEy  += k * (dy - l * dy / dist);
        d2Ex += k * (1  - l * dy * dy / dist3);
        d2Ey += k * (1  - l * dx * dx / dist3);
        dExy += k * (l  * dx * dy / dist3);
      }
      const det = d2Ex * d2Ey - dExy * dExy;
      if (Math.abs(det) < 1e-12) break;
      const stepX = (dExy * dEy - d2Ey * dEx) / det;
      const stepY = (dExy * dEx - d2Ex * dEy) / det;
      pos[m].x += stepX;
      pos[m].y += stepY;
      if (Math.sqrt(stepX * stepX + stepY * stepY) < EPSILON * 0.1) break;
    }
  }
  return pos;
}

/** Total K-K stress energy — used to compare seeds. */
function totalStress(pos, n, K, L) {
  let E = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = pos[i].x - pos[j].x;
      const dy = pos[i].y - pos[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1e-9;
      E += K[i][j] * (dist - L[i][j]) ** 2;
    }
  }
  return E;
}

/**
 * PCA line-straightening.  Each station is pulled toward the best-fit axis of
 * its line.  The pull strength is `alpha / lineCounts[i]` so interchange
 * stations (on N lines) are pulled N× more gently — preventing competing
 * forces from distorting the layout.
 */
function straightenLines(pos, lines, idxOf, lineCounts, passes, alpha) {
  for (let pass = 0; pass < passes; pass++) {
    for (const line of lines) {
      const members = line.stations
        .map(s => idxOf[s.id])
        .filter(i => i !== undefined);
      if (members.length < 3) continue; // 2-station lines need no straightening

      let cx = 0, cy = 0;
      for (const i of members) { cx += pos[i].x; cy += pos[i].y; }
      cx /= members.length; cy /= members.length;

      let cxx = 0, cxy = 0, cyy = 0;
      for (const i of members) {
        const dx = pos[i].x - cx, dy = pos[i].y - cy;
        cxx += dx * dx; cxy += dx * dy; cyy += dy * dy;
      }

      // Principal eigenvector of the 2×2 covariance matrix
      const trace  = cxx + cyy;
      const disc   = Math.sqrt((cxx - cyy) ** 2 + 4 * cxy * cxy);
      const lam1   = (trace + disc) / 2;
      let ex = lam1 - cyy, ey = cxy;
      const eLen   = Math.sqrt(ex * ex + ey * ey) || 1;
      ex /= eLen; ey /= eLen;

      for (const i of members) {
        const weight  = alpha / lineCounts[i]; // softer for interchange nodes
        const dx      = pos[i].x - cx, dy = pos[i].y - cy;
        const proj    = dx * ex + dy * ey;
        const onAxisX = cx + proj * ex;
        const onAxisY = cy + proj * ey;
        pos[i].x += weight * (onAxisX - pos[i].x);
        pos[i].y += weight * (onAxisY - pos[i].y);
      }
    }
  }
}

/**
 * Iteratively push apart any pair of nodes closer than `minDist`.
 * Prevents station overlap after straightening.
 */
function separateNodes(pos, n, minDist) {
  for (let iter = 0; iter < 40; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[j].x - pos[i].x;
        const dy = pos[j].y - pos[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1e-9;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          pos[i].x -= nx * push; pos[i].y -= ny * push;
          pos[j].x += nx * push; pos[j].y += ny * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

/** Scale + centre the normalised positions to fill the canvas. */
function fitToCanvas(pos, ids, canvasWidth, canvasHeight, marginFrac) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pos) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  const rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
  const availW = canvasWidth  * (1 - 2 * marginFrac);
  const availH = canvasHeight * (1 - 2 * marginFrac);
  const scale  = Math.min(availW / rangeX, availH / rangeY);
  const offX   = canvasWidth  / 2 - ((minX + maxX) / 2) * scale;
  const offY   = canvasHeight / 2 - ((minY + maxY) / 2) * scale;

  const result = {};
  ids.forEach((id, i) => {
    result[id] = { x: pos[i].x * scale + offX, y: pos[i].y * scale + offY };
  });
  return result;
}
