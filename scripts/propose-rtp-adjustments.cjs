"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/propose-rtp-adjustments.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var workspace = "c://Kroova//scripts";
function loadSimFiles() {
  const files = import_fs.default.readdirSync(workspace).filter((f) => f.startsWith("simulation_results_") && f.endsWith(".json"));
  const results = [];
  for (const f of files) {
    const raw = import_fs.default.readFileSync(import_path.default.join(workspace, f), "utf-8");
    try {
      const data = JSON.parse(raw);
      results.push({
        booster: data.booster,
        price_brl: data.price_brl,
        cards_per_booster: data.cards_per_booster,
        openings: data.openings,
        rtp: data.rtp_pct,
        godmode_realized_pct: data.godmode_realized_pct,
        rarity_distribution: data.rarity_distribution
      });
    } catch (e) {
      console.warn("Failed to parse", f, e);
    }
  }
  return results;
}
function targetRtpFor(booster) {
  const b = booster.toLowerCase();
  if (b.includes("lend") || b.includes("legend")) return [10, 25];
  if (b.includes("premium")) return [25, 35];
  if (b.includes("b\xE1sico") || b.includes("basico") || b.includes("padrao")) return [35, 45];
  return [30, 40];
}
function recommendMultiplier(currentMultiplier, currentRtp, [minTarget, maxTarget]) {
  const target = (minTarget + maxTarget) / 2;
  if (!currentMultiplier || currentMultiplier <= 0) {
    return { recommendedMultiplier: void 0, note: "Missing current multiplier" };
  }
  const scale = target / Math.max(1, currentRtp);
  const recommended = Math.max(1, Math.round(currentMultiplier * scale));
  return { recommendedMultiplier: recommended, note: `scale ${scale.toFixed(2)}` };
}
function getCurrentMultipliers() {
  const map = {
    "Basico": 1,
    "Padrao": 2,
    "Premium": 4,
    "Pack Viral": 1,
    "Pack Lendario": 1,
    "Elite": 10,
    "Pack Epico": 1,
    "Whale": 20,
    "Pack Colecionador": 1,
    "Booster B\xE1sico": 15,
    "Booster Premium": 45,
    "Booster Lend\xE1rio": 150
  };
  return map;
}
function main() {
  const sims = loadSimFiles();
  const multipliers = getCurrentMultipliers();
  const rows = [];
  rows.push("Booster | RTP% | Godmode% | Curr\xD7 | Target RTP | Rec\xD7 | Note");
  rows.push("------- | ---- | -------- | ----- | ---------- | ---- | ----");
  for (const s of sims) {
    const targets = targetRtpFor(s.booster);
    const curr = multipliers[s.booster];
    const rec = recommendMultiplier(curr, s.rtp, targets);
    rows.push([
      s.booster,
      s.rtp.toFixed(2),
      s.godmode_realized_pct.toFixed(2),
      curr ?? NaN,
      `${targets[0]}\u2013${targets[1]}`,
      rec.recommendedMultiplier ?? "n/a",
      rec.note
    ].join(" | "));
  }
  const out = rows.join("\n");
  console.log("\nRTP Adjustment Proposals\n");
  console.log(out);
  import_fs.default.writeFileSync(import_path.default.join(workspace, "rtp-adjustments-table.md"), out);
}
main();
