/* =========================================================
   LUMEN — maillage du RELIEF d'une zone (terrasses, rampes, falaises). Voir js/altitude.js pour le modèle.
   Pour chaque case de la zone :
     - dessus : 1 quadrilatère si le sol est plat, sinon 4 quarts (sommets = heightOfCell aux coins, milieux d'arêtes
       et centre) : les pentes (rampes, escaliers lissés) sont donc EXACTEMENT celles de heightAt ;
     - parois : sur chaque arête dont le voisin est vide (ou un pont) → paroi de terre jusqu'au socle (BOTTOM) ;
       dont le voisin est plus bas de plus d'un pas (|Δh| > MAX_STEP) → FALAISE rocheuse jusqu'au dessus du voisin.
       Les parois sont facettées (sommets intérieurs décalés) pour un rendu roche low-poly, sans fissure aux jonctions.
   Une seule géométrie non indexée à couleurs de sommets par zone (un appel de dessin).
   ========================================================= */
import * as THREE from 'three';
import { heightOfCell, levelAt, MAX_STEP } from '../altitude.js';
import { hash, T } from '../engine/util.js';

export const BOTTOM = -2.4;   // bas des parois (le dessous des îles, ses cônes de roche, commence là)

export function buildReliefMesh(isl, zi, cells, th, tileColor, material) {
  const pos = [], col = [];
  const C = (hex) => new THREE.Color(hex);
  const push = (p, c) => { pos.push(p[0], p[1], p[2]); col.push(c.r, c.g, c.b); };
  /* triangle orienté : la normale doit regarder du côté de `out` (vecteur) */
  const tri = (a, b, c, color, out) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * out[0] + ny * out[1] + nz * out[2] < 0) { push(a, color); push(c, color); push(b, color); } else { push(a, color); push(b, color); push(c, color); }
  };
  const quad = (a, b, c, d, color, out) => { tri(a, b, c, color, out); tri(a, c, d, color, out); };
  const UP = [0, 1, 0];
  const inZone = (x, y) => isl.zoneAt[y] && isl.zoneAt[y][x] === zi;
  const land = (x, y) => { const t = isl.terrain[y] && isl.terrain[y][x]; return t !== undefined && t !== ' ' && t !== '='; };
  const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];   // N E S W (z = ligne)

  cells.forEach(([x, y]) => {
    const cx = x * T, cz = y * T, h = T / 2;
    const H = (ox, oz) => heightOfCell(isl, x, y, cx + ox * h, cz + oz * h);
    const g = []; for (let j = 0; j < 3; j++) { g.push([]); for (let i = 0; i < 3; i++) g[j].push([cx + (i - 1) * h, H(i - 1, j - 1), cz + (j - 1) * h]); }
    const c = tileColor(x, y);
    const flat = g.every((row) => row.every((p) => Math.abs(p[1] - g[0][0][1]) < 1e-6));
    if (flat) quad(g[0][0], g[0][2], g[2][2], g[2][0], c, UP);
    else for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) quad(g[j][i], g[j][i + 1], g[j + 1][i + 1], g[j + 1][i], c, UP);

    /* parois */
    const lv = levelAt(isl, x, y);
    dirs.forEach(([dx, dz], di) => {
      const nx = x + dx, ny = y + dz;
      const nl = land(nx, ny) ? levelAt(isl, nx, ny) : null;
      let kind = null;
      if (nl === null) kind = 'void';
      else if (lv - nl > MAX_STEP + 1e-6) kind = 'cliff';
      if (!kind) return;
      /* 3 points le long de l'arête (de gauche à droite en regardant vers l'extérieur) */
      const along = dx === 0 ? [[-1, dz], [0, dz], [1, dz]] : [[dx, -1], [dx, 0], [dx, 1]];   // (ox, oz) dans la case
      const top = along.map(([ox, oz]) => [cx + ox * h, H(ox, oz), cz + oz * h]);
      let bot;
      if (kind === 'void') bot = top.map((p) => [p[0], BOTTOM, p[2]]);
      else bot = along.map(([ox, oz]) => [cx + ox * h, heightOfCell(isl, nx, ny, cx + ox * h, cz + oz * h), cz + oz * h]);
      const drop = Math.max(...top.map((p, i) => p[1] - bot[i][1]));
      if (drop < 1e-3) return;
      const rows = kind === 'cliff' ? Math.max(1, Math.round(drop / 1.1)) : Math.max(1, Math.round(drop / 1.6));
      const out = [dx, 0, dz];
      const base = kind === 'cliff' ? C(th.rock) : C(th.dirt);
      /* grille (rows+1) × 3 de sommets ; seuls les sommets strictement intérieurs sont décalés (jonctions sans fissure) */
      const V = [];
      for (let r = 0; r <= rows; r++) {
        const row = [];
        for (let k = 0; k < 3; k++) {
          const t = r / rows, p = [top[k][0] + (bot[k][0] - top[k][0]) * t, top[k][1] + (bot[k][1] - top[k][1]) * t, top[k][2] + (bot[k][2] - top[k][2]) * t];
          if (k === 1 && r > 0 && r < rows) { const j = (hash(x * 4 + di, y, 301 + r) - 0.5) * (kind === 'cliff' ? 0.5 : 0.3); p[0] += dx * j; p[2] += dz * j; p[1] += (hash(x, y * 4 + di, 311 + r) - 0.5) * 0.25; }
          row.push(p);
        }
        V.push(row);
      }
      for (let r = 0; r < rows; r++) for (let k = 0; k < 2; k++) {
        const cc = base.clone().offsetHSL(0, 0, (hash(x * 8 + di * 2 + k, y, 320 + r) - 0.5) * 0.09 - (kind === 'cliff' ? r * 0.012 : r * 0.02));
        quad(V[r][k], V[r][k + 1], V[r + 1][k + 1], V[r + 1][k], cc, out);
      }
    });
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere(); geo.computeBoundingBox();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
