/* =========================================================
   LUMEN — « lift » : pose des objets DYNAMIQUES sur le relief.
   Convention : la hauteur logique (position.y) d'un objet dynamique est sa hauteur au-dessus du sol local.
   Juste avant le rendu on ajoute heightAt(x, z) à chaque objet enregistré, juste après on la retire :
   le code de jeu (combat, IA, projectiles, effets, PNJ…) n'a donc jamais à connaître l'altitude.
     lift.add(obj [, fn])   objet seul (fn() facultatif : hauteur à utiliser à la place de heightAt)
     lift.addGroup(group)   chaque enfant direct du groupe (le groupe doit être à l'origine)
     lift.worldY(obj)       position.y MONDE de l'objet (pour les tests et les effets)
   Île plate : heightAt vaut 0 partout, rien ne bouge.
   ========================================================= */
import { heightAt, hasRelief } from '../altitude.js';

const singles = new Map(), groups = new Set(), applied = [];

export const lift = {
  add(obj, fn) { singles.set(obj, fn || null); return obj; },
  remove(obj) { singles.delete(obj); },
  addGroup(g) { groups.add(g); return g; },
  height(obj) { const fn = singles.get(obj); return fn ? fn() : heightAt(obj.position.x, obj.position.z); },
  worldY(obj) { return obj.position.y + (hasRelief() ? this.height(obj) : 0); },
  apply() {
    if (!hasRelief()) return;
    singles.forEach((fn, o) => { const h = fn ? fn() : heightAt(o.position.x, o.position.z); o.position.y += h; applied.push(o, h); });
    groups.forEach((g) => g.children.forEach((o) => { const h = heightAt(o.position.x, o.position.z); o.position.y += h; applied.push(o, h); }));
  },
  restore() {
    for (let i = applied.length - 2; i >= 0; i -= 2) applied[i].position.y -= applied[i + 1];
    applied.length = 0;
  },
};
