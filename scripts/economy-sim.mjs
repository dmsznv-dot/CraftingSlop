import {createRun,stepRun,extendEndlessMine,activateSkill,skillStats} from '../src/core.ts';
import {PICKS} from '../src/core.ts';
import {freshProgress,buy,buySkill,upgradeSkill,PRICES,skillPrice} from '../src/progress.ts';
import {syncAchievements,readyAchievements,claimAchievement,ACHIEVEMENTS} from '../src/achievements.ts';

const DT=1/60,SEED_BASE=7001;
function simulateRun(pick,seed,aura='none',level=0){
 const run=createRun(0,pick,'none',false,seed);run.status='playing';let time=0,nextSkill=5,uses=0;
 if(aura!=='none'&&level){run.skillAura=aura;run.skillLevel=level;run.skillMaxCharges=skillStats(aura,level).uses;run.skillCharges=run.skillMaxCharges;}
 while(run.status==='playing'&&time<240){
  stepRun(run,DT);time+=DT;while(run.rows*32-run.y<400)extendEndlessMine(run);
  if(run.skillAura&&run.skillCharges>0&&time>=nextSkill&&!(run.skillAura==='ghost'&&(run.skillGhostTime??0)>0)){
   if(activateSkill(run))uses++;nextSkill=time+12;
  }
 }
 return {depth:Math.floor(run.y/32),ore:run.ore,seconds:time,status:run.status,run,uses};
}
function quantile(rows,key,q){const xs=rows.map(x=>x[key]).sort((a,b)=>a-b);return xs[Math.floor((xs.length-1)*q)];}
function runStats(rows){return {depth:{p10:quantile(rows,'depth',.1),median:quantile(rows,'depth',.5),p90:quantile(rows,'depth',.9),mean:+(rows.reduce((s,x)=>s+x.depth,0)/rows.length).toFixed(1)},ore:{p10:quantile(rows,'ore',.1),median:quantile(rows,'ore',.5),p90:quantile(rows,'ore',.9),mean:+(rows.reduce((s,x)=>s+x.ore,0)/rows.length).toFixed(1)},seconds:{median:+quantile(rows,'seconds',.5).toFixed(1),mean:+(rows.reduce((s,x)=>s+x.seconds,0)/rows.length).toFixed(1)}};}
function distribution(){
 const output={sample:'30 deterministic seeds per pick; seed=7001..7030; step=1/60 s; auto-drop, no nudges, no purchased skills',picks:{}};
 for(const pick of Object.keys(PICKS)){const rows=Array.from({length:30},(_,i)=>simulateRun(pick,SEED_BASE+i));output.picks[pick]=runStats(rows);}
 output.skills={};
 for(const [pick,aura] of [['iron','fire'],['iron','lightning'],['iron','enchanted'],['iron','ghost'],['gold','fire'],['diamond','fire']]){
  const rows=Array.from({length:12},(_,i)=>simulateRun(pick,SEED_BASE+i,aura,1));output.skills[`${pick}-${aura}`]={...runStats(rows),usesMean:+(rows.reduce((s,x)=>s+x.uses,0)/rows.length).toFixed(2)};
 }
 return output;
}
const report=distribution();
report.sample={seeds:30,seedStart:SEED_BASE,stepSeconds:DT,controls:'automatic descent, no nudges, no ads, no paid purchases',skillSamplesPerConfiguration:12};
report.achievementRewardTotal=ACHIEVEMENTS.reduce((s,a)=>s+a.reward,0);
console.log(JSON.stringify(report,null,2));
