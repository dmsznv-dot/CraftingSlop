import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BLOCKS} from '../src/core.ts';
import {atlasGroups,guideCopy} from '../src/guide.ts';

test('block atlas covers each block exactly once with both translations',()=>{
 const entries=atlasGroups.flatMap(group=>group.entries);
 const activeBlocks=Object.keys(BLOCKS).filter(type=>type!=='relic'); // Legacy saves may still contain relics.
 assert.equal(entries.length,activeBlocks.length);
 assert.deepEqual(entries.map(entry=>entry.type).sort(),activeBlocks.sort());
 for(const entry of entries)for(const lang of ['ru','en'] as const){assert.ok(entry.name[lang]);assert.ok(entry.description[lang]);}
 for(const lang of ['ru','en'] as const)assert.ok(guideCopy[lang].steps.length);
});
