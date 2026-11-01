import test from 'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{validateRecord}from'./execution.mjs';import{validatorFor}from'./collection_review.mjs';
const rows=Array.from({length:10},(_,i)=>JSON.parse(readFileSync(new URL('./fixtures/teaching43_special_'+i+'.json',import.meta.url),'utf8')));
async function validate(row){validateRecord(row.raw,row.condition);(await validatorFor(row.condition))(row.raw,row.condition);}
test('ten actual frozen special acquisition records pass both contracts',async()=>{assert.equal(rows.length,10);for(const r of rows)await validate(r);});
test('false outer identity, banned affiliation, lost source and fabricated callback schedule reject',async()=>{
    for(const source of rows){for(const mutate of [r=>{r.condition.parameters.qualification_evidence=[];},r=>{r.raw.after[0].cultivation.class='wizard';},r=>{r.raw.metrics[1].attacks=1;},r=>{r.raw.teaching[0].elapsed=null;},r=>{r.raw.teaching[0].message_scope='unobserved';}]){const r=structuredClone(source);mutate(r);await assert.rejects(()=>validate(r));}}
    const duplicate=rows.find(r=>r.condition.id.includes('duplicate-case'));
    const r=structuredClone(duplicate);r.raw.before[0].cultivation['family/family_name']='武当派';r.raw.after[0].cultivation['family/family_name']='武当派';await assert.rejects(()=>validate(r));
    const hong=rows.find(r=>r.condition.id.endsWith('food-level200'));
    for(const role of ['actor','target']){const r=structuredClone(hong);for(const s of r.raw.teaching)for(const p of [s.hong_before,s.hong_after])p[role].family='丐帮';await assert.rejects(()=>validate(r));}
    const gift=rows.find(r=>r.condition.id.includes('ouyang-gift'));
    for(const change of [cb=>{cb.remaining=0;},cb=>{cb.args=['invented'];}]){const r=structuredClone(gift);change(r.raw.teaching[1].gift_after.return_callbacks[0]);await assert.rejects(()=>validate(r));}
});
