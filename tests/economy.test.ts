import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BALANCE} from '../src/balance.ts';
import {ACHIEVEMENTS,claimAchievement,readyAchievements} from '../src/achievements.ts';
import {buySkill,freshProgress,PRICES,skillPrice,upgradeSkill} from '../src/progress.ts';
import {decodeProgress} from '../src/storage.ts';
import {collectBlock,createRun,maxDurability,PICKS,pickDamage} from '../src/core.ts';

test('tunable prices and achievement rewards are served from one balance table',()=>{
 assert.deepEqual(Object.values(BALANCE.pickPrices),[0,40,550,2500,10000,40000,130000]);
 assert.equal(PRICES.stone,BALANCE.pickPrices.stone);assert.equal(PRICES.iron,BALANCE.pickPrices.iron);
 assert.equal(skillPrice('fire',1),BALANCE.skillPrices.fire[0]);assert.equal(skillPrice('ghost',6),0);
 assert.equal(ACHIEVEMENTS.length,47);assert.equal(ACHIEVEMENTS.reduce((sum,a)=>sum+a.reward,0),49630);
});

test('gold pick has a real damage and durability advantage over iron',()=>{
 assert.ok(PICKS.gold.hp>PICKS.iron.hp);assert.equal(PICKS.gold.nudges,PICKS.iron.nudges+1);
 assert.ok(pickDamage('gold','dirt')>pickDamage('iron','dirt'));
 assert.ok(pickDamage('gold','stone')>pickDamage('iron','stone'));
});

test('ability purchase and each upgrade charge exactly once and reject insufficient funds',()=>{
 const p=freshProgress();p.coins=skillPrice('fire',1)-1;
 assert.equal(buySkill(p,'fire'),false);assert.equal(p.skillLevels.fire,0);assert.equal(p.coins,skillPrice('fire',1)-1);
 p.coins++;assert.equal(buySkill(p,'fire'),true);assert.equal(p.skillLevels.fire,1);assert.equal(p.coins,0);
 assert.equal(buySkill(p,'fire'),false);assert.equal(p.coins,0);
 p.coins=skillPrice('fire',2)*2;assert.equal(upgradeSkill(p,'fire'),true);assert.equal(p.skillLevels.fire,2);assert.equal(p.coins,skillPrice('fire',2));
 assert.equal(upgradeSkill(p,'fire'),false);assert.equal(p.skillLevels.fire,2);assert.equal(p.coins,skillPrice('fire',2));
});

test('existing unlocked abilities and saved currency migrate without charges or loss',()=>{
 const p=freshProgress();p.coins=2345;p.skillLevels={fire:3,lightning:1,enchanted:0,ghost:5};p.aura='fire';
 const restored=decodeProgress(JSON.stringify(p));assert.ok(restored);assert.equal(restored.coins,2345);assert.deepEqual(restored.skillLevels,p.skillLevels);assert.equal(restored.aura,'fire');
});

test('ancient shard achievements are present, claimable and pay only once',()=>{
 const p=freshProgress();p.relics=1;
 assert.ok(readyAchievements(p).some(a=>a.id==='relics-1'));
 assert.equal(claimAchievement(p,'relics-1'),200);assert.equal(claimAchievement(p,'relics-1'),0);
});

test('a workbench advances one pick tier at a time and can be used only once',()=>{
 const tiers=['wood','stone','iron','gold','diamond','obsidian','netherite'] as const;
 const expected=['stone','iron','gold','diamond','obsidian','netherite','netherite'] as const;
 for(let i=0;i<tiers.length;i++){
  const pick=tiers[i],r=createRun(0,pick,'none',false,100+i);r.hp=PICKS[pick].hp;
  collectBlock(r,{x:2,y:8,type:'bench',hp:1});
  assert.equal(r.pick,expected[i]);assert.equal(r.benchUsed,true);
  if(i<tiers.length-1)assert.equal(r.hp,PICKS[expected[i]].hp);
  else assert.equal(maxDurability(r),PICKS.netherite.hp+Math.round(PICKS.netherite.hp*.5));
  const afterFirst={pick:r.pick,hp:r.hp,hpBonus:r.hpBonus};
  collectBlock(r,{x:3,y:9,type:'bench',hp:1});
  assert.deepEqual({pick:r.pick,hp:r.hp,hpBonus:r.hpBonus},afterFirst,'a second bench cannot upgrade twice');
 }
});
