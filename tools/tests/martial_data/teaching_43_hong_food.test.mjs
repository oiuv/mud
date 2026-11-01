import test from 'node:test';
import assert from 'node:assert/strict';
import {hongFood43Conditions,validateHongFood43Record} from './teaching_43_hong_food.mjs';
import {readTeaching43Source} from './teaching_43_contract.mjs';
test('original enable/cook/give at120/200 with actual separate online partner, no injected dish or permission',()=>{
    const cs=hongFood43Conditions({},readTeaching43Source);assert.equal(cs.length,2);assert.equal(cs.reduce((n,c)=>n+c.samples,0),4);
    for(const c of cs){assert.equal(c.parameters.material_amount,2);assert.deepEqual(c.parameters.teaching_expectations.map(s=>s.command_kind),['enable','cook','give']);
        for(const k of c.parameters.monitored_grants){assert.ok(!Object.hasOwn(c.parameters.actor.properties,k));assert.ok(!Object.hasOwn(c.parameters.target.properties,k));}}
    assert.equal(cs[1].parameters.actor.properties['couple/id'],'right');assert.throws(()=>validateHongFood43Record({outcome:'observed',teaching:[]},cs[0]));
});
