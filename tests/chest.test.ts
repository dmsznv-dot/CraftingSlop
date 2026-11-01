import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectBlock,createRun,extendEndlessMine} from '../src/core.ts';
import {freshProgress} from '../src/progress.ts';
import {decodeProgress} from '../src/storage.ts';

test('chests award 1000 nuggets exactly once',()=>{
 const r=createRun(0,'wood','none',false,42),chest={x:2,y:5,type:'vein' as const,hp:1};
 collectBlock(r,chest);assert.equal(r.ore,1000);collectBlock(r,chest);assert.equal(r.ore,1000);
});
test('legacy relics are removed without losing the saved run or wallet',()=>{
 const p=freshProgress();p.coins=1234;const r=createRun(0,'wood','none',false,42);r.blocks.push({x:2,y:5,type:'relic',hp:1});p.endlessAttempt=r;
 const loaded=decodeProgress(JSON.stringify(p));assert.ok(loaded?.endlessAttempt);assert.equal(loaded.coins,1234);assert.equal(loaded.endlessAttempt.id,r.id);assert.ok(loaded.endlessAttempt.blocks.every(b=>b.type!=='relic'));
 extendEndlessMine(loaded.endlessAttempt,200);assert.ok(loaded.endlessAttempt.blocks.every(b=>b.type!=='relic'));
});
test('chests are rare and only generate after 100 rows of depth',()=>{
 let count=0;
 for(let seed=1;seed<=100;seed++){
  const r=createRun(0,'wood','none',false,seed);while(r.rows<304)extendEndlessMine(r);
  const chests=r.blocks.filter(b=>b.type==='vein');assert.ok(chests.every(b=>b.y>=104));count+=chests.length;
 }
 assert.ok(count>0&&count<150,`unexpected number of chests: ${count}`);
});
test('old fixed test chest is removed when restoring a run',()=>{
 const p=freshProgress(),r=createRun(0,'wood','none',false,42);
 r.blocks=r.blocks.filter(b=>b.x!==7||b.y!==6);r.blocks.push({x:7,y:6,type:'vein',hp:1});p.endlessAttempt=r;
 const loaded=decodeProgress(JSON.stringify(p));assert.ok(loaded?.endlessAttempt);assert.ok(!loaded.endlessAttempt.blocks.some(b=>b.x===7&&b.y===6&&b.type==='vein'));
});
