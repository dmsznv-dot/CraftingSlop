/** Single source of tunable economy values. Amounts are nuggets. */
export const BALANCE={
 pickPrices:{wood:0,stone:40,iron:550,gold:2500,diamond:10000,obsidian:40000,netherite:130000},
 itemPrices:{starter:120,wave:900,chain:900,helmet:1200},
 skillMaxLevel:5,
 // Index 0 is the price to unlock level 1; each later slot buys the next level.
 skillPrices:{
  fire:[550,900,1500,2400,3800],
  lightning:[700,1100,1900,3000,4800],
  enchanted:[600,950,1600,2600,4200],
  ghost:[600,950,1600,2600,4200],
 },
 skillEffects:{
  uses:[1,2,2,3,3],
  duration:[3,3,4,4,5],
  lightningRadius:[3,3,4,4,5],
  enchantedDuration:[2,2,2.5,2.5,3],
  enchantedSpeed:[1,1,1,1,1.15],
  ghostSpeed:[1,1,1,1,1.1],
 },
 achievementRewards:{
  // Early milestones stack within a few descents: trim their payouts by ~20%.
  bestDepth:[160,320,650,1500,2500,4000],woodDepth:[160,650],
  bestOre:[80,200,400,800,2000,4000],oreBlocks:[120,600,1800],totalOre:[500,1500,3500],oreTypes:[240,1200],
  bestTnt:[120,320,1000],tnt:[250,800,2200],bestBonuses:[120,320,1000],bonuses:[200,1000,3000],
  bonusTypes:[240,800],helmetSaves:[600],runs:[120,500,1200,3000],ownedPicks:[160,1000,2500],relics:[200,600,1500],
 },
} as const;

export type SkillKey=keyof typeof BALANCE.skillPrices;
export function skillPrice(skill:SkillKey,targetLevel:number):number{
 return Number.isInteger(targetLevel)&&targetLevel>=1&&targetLevel<=BALANCE.skillMaxLevel?BALANCE.skillPrices[skill][targetLevel-1]:0;
}
