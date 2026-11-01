import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{validateRecord}from'./execution.mjs';import{validatorFor}from'./collection_review.mjs';import{digest}from'./ledger.mjs';
const rows=Object.fromEntries(['zhou','kuihua'].map(n=>[n,JSON.parse(readFileSync(new URL('./fixtures/teaching43_'+n+'_golden.json',import.meta.url),'utf8'))]));
async function validate(r){validateRecord(r.raw,r.condition);(await validatorFor(r.condition))(r.raw,r.condition);}
test('real finite competition and original-time conversion survive strict current consumer',async()=>{for(const r of Object.values(rows)){assert.equal(digest(r.raw),r.origin.raw_sha256);await validate(r);}});
test('Zhou attacks, resource/identity input, complete event ledger and adjacent lost reward window cannot be forged',async()=>{
    for(const mutate of [r=>{r.raw.attacks[0].damage=100000;},r=>{r.raw.attacks[0].type=99;},r=>{r.raw.attacks[0].result=99;},r=>{r.raw.attacks=r.raw.attacks.slice(0,1);},
        r=>{r.raw.metrics[0].invented_resource=999;},r=>{r.raw.before[0].temp.apply.unarmed_damage=500000;},r=>{r.raw.before[0].qi=1;r.raw.after[0].qi=1;},
        r=>{r.raw.before[0].gender='未知';},r=>{r.raw.after[0].max_qi=1;},r=>{for(const e of r.raw.zhou_lost)e.point.teacher_qi=1;},
        r=>{r.raw.zhou_lost[0].elapsed=r.raw.zhou_lost[1].elapsed+1;},r=>{for(const e of r.raw.zhou_lost)e.point.state.combat_exp+=100000;r.raw.zhou_final.state.combat_exp+=100000;r.raw.after[0].combat_exp+=100000;},
        ...['callbacks','passives','interfaces'].map(k=>r=>{r.raw[k].push({fake:1});}),r=>{r.raw.defenses[0].incoming=99999;},r=>{r.raw.dodge_checks[0].phase='fake';}]){const r=structuredClone(rows.zhou);mutate(r);await assert.rejects(()=>validate(r));}
});
test('Kuihua outer teaching flag, real timer type, actual callback count and point resources stay bound',async()=>{
    for(const mutate of [r=>{r.raw.after[0].temp.teach_kh=1;},r=>{r.raw.kuihua_immediate.pending[0].remaining='2';},r=>{r.raw.kuihua_entries.pop();},
        r=>{r.raw.kuihua_entries[0].elapsed=.001;},r=>{r.raw.kuihua_entries[1].point.qi++;},r=>{r.raw.metrics[0].eff_qi_cost=0;},r=>{r.raw.kuihua_terminal='converted';r.raw.kuihua_final.teach_kh=1;},
        r=>{delete r.raw.immediate;},r=>{r.raw.immediate[0].living=0;},r=>{r.raw.immediate[0].neili++;},r=>{r.raw.immediate[1].object='/fake';},
        r=>{r.raw.before[0].cultivation['special_skill/guimai']=1;},r=>{const d=r.raw.kuihua_entries[0].elapsed-.5;for(const e of r.raw.kuihua_entries)e.elapsed-=d;},r=>{r.raw.elapsed=r.raw.kuihua_entries.at(-1).elapsed+3;}]){const r=structuredClone(rows.kuihua);mutate(r);await assert.rejects(()=>validate(r));}
});
