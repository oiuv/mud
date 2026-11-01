import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateRecord} from './execution.mjs';
import {validatorFor} from './collection_review.mjs';
import {sha256} from './inventory.mjs';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/teaching43_goldens.json',import.meta.url),'utf8'));
async function validate(row){validateRecord(row.raw,row.condition);(await validatorFor(row.condition))(row.raw,row.condition);}
test('six frozen real two-USER records pass validateRecord and the current semantic consumer',async()=>{
    assert.equal(fixture.rows.length,6);
    for(const row of fixture.rows){assert.equal(row.raw.before.length,2);assert.equal(row.raw.after.length,2);await validate(row);}
});
test('learning point types, outer-state contradiction, real teacher level, source metadata and resource types reject',async()=>{
    const source=fixture.rows.find(r=>r.condition.id==='teaching-43-permission-hujia-daofa-acquire');
    for(const mutate of [r=>{r.raw.teaching[0].after.learned_points='1';},r=>{r.raw.teaching[0].after.learned_points=true;},
        r=>{r.raw.after[0].learned_points=50000;},r=>{r.condition.parameters.teacher_level=1;r.raw.teaching[0].teacher_skills['hujia-daofa']=1;},
        r=>{r.condition.parameters.teaching_evidence={};},r=>{r.condition.entry_id='fake';},
        r=>{r.condition.parameters.qualification_evidence=[];},r=>{r.raw.metrics[0].neili_cost='0';},
        r=>{r.raw.teaching[0].skill_after_command=999;},r=>{r.raw.launches.push({fake:1});}]){
        const r=structuredClone(source);mutate(r);await assert.rejects(()=>validate(r));
    }
});
test('async callbacks bind source time/order/queue; fake teacher, mid-class repair, attacks and target changes reject',async()=>{
    const source=fixture.rows.find(r=>r.condition.id==='teaching-43-async-yue-buqun-grant');
    for(const mutate of [r=>{r.raw.teaching_gate_entries[1].elapsed=r.raw.teaching_gate_entries[0].elapsed+.0001;},
        r=>{r.raw.teaching_gate_entries[1].elapsed=10000;},r=>{r.raw.recruit_wait.teacher_before.callbacks[0].remaining=-99;},
        r=>{delete r.raw.teaching[0].teacher_identity;},r=>{delete r.raw.teaching[0].teacher_family;},
        r=>{r.raw.after[1].skills.force++;},r=>{r.raw.after[0].living=0;},r=>{r.raw.attacks.push({fake:1});},
        r=>{r.raw.recruit_wait.after.recruitment.family.enter_time=1;},
        r=>{const old=r.raw.teaching[0].teacher,replacement='X'.repeat(r.condition.parameters.teacher.path.length)+'#7';
            r.raw=JSON.parse(JSON.stringify(r.raw).split(old).join(replacement));}]){
        const r=structuredClone(source);mutate(r);await assert.rejects(()=>validate(r));
    }
    const ding=structuredClone(fixture.rows.find(r=>r.condition.id==='teaching-43-async-ding-grant'));
    ding.raw.teaching[1].after.recruitment.class='wizard';ding.raw.teaching[2].before.recruitment.class='wizard';
    await assert.rejects(()=>validate(ding));
});

test('all nonteaching event channels, second-user counters and intermediate state pulses reject',async()=>{
    for(const source of fixture.rows)for(const key of ['attacks','launches','interfaces','callbacks','passives','defenses','dodge_checks','terminals']){
        const r=structuredClone(source);r.raw[key].push({forged:1});await assert.rejects(()=>validate(r));
    }
    for(const source of fixture.rows){
        for(const mutate of [r=>{r.raw.metrics[1].attacks=99;},r=>{r.raw.after[0].max_qi++;},
            r=>{r.raw.before[0].qi=1;r.raw.after[0].qi=1;},r=>{r.raw.before[0].gender='未知';}]){
            const r=structuredClone(source);mutate(r);await assert.rejects(()=>validate(r));
        }
    }
    const source=fixture.rows.find(r=>r.condition.id==='teaching-43-async-yue-buqun-grant');
    for(const mutate of [r=>{r.raw.recruit_wait.elapsed=9;},r=>{r.raw.teaching[0].elapsed=10000;},
        r=>{r.raw.teaching_gate_entries[2].elapsed=0;},r=>{r.raw.teaching[0].after.recruitment.name='假的';r.raw.recruit_wait.before.recruitment.name='假的';}]){
        const r=structuredClone(source);mutate(r);await assert.rejects(()=>validate(r));
    }
});
