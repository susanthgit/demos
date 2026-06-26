/* ============================================================
   Named cost model — "cowork-cost-illustrative"
   ⚠️ ILLUSTRATIVE PLACEHOLDERS to shape a conversation — NOT Microsoft
   pricing, NOT a quote. Numbers stay HERE (never inlined in components) so
   the cost scene can't drift into unsourced pricing. Replace with verified
   figures + a public source in the demo's truth-ledger before customer use.
   ============================================================ */

export const COWORK_COST_ILLUSTRATIVE = {
  id: 'cowork-cost-illustrative',
  packPrice: 9,        // illustrative $ per decision-pack produced
  flatSeat: 30,        // illustrative $ per seat / month (whole org)
  analystDay: 600,     // illustrative $ value of one analyst-day
  daysPerPack: 3.5,    // planning estimate: analyst-days a pack replaces
  source: 'placeholder — replace with public Microsoft Cowork billing docs',
};

export interface CostInputs { users: number; packs: number; }

export function computeCost(i: CostInputs, m = COWORK_COST_ILLUSTRATIVE) {
  const totalPacks = i.users * i.packs;
  const cwCost = totalPacks * m.packPrice;
  const flatCost = i.users * m.flatSeat;
  const analystCost = totalPacks * m.daysPerPack * m.analystDay;
  const daysSaved = totalPacks * m.daysPerPack;
  return { totalPacks, cwCost, flatCost, analystCost, daysSaved };
}
