import test from 'node:test';
import assert from 'node:assert/strict';
import {ordination43Conditions,validateOrdination43Record} from './teaching_43_ordination.mjs';
import {readTeaching43Source} from './teaching_43_contract.mjs';
test('five original ordination handlers have male acquisition and female refusal, original kneel and repeated ask',()=>{
    const cs=ordination43Conditions({},readTeaching43Source);assert.equal(cs.length,10);assert.equal(cs.reduce((n,c)=>n+c.samples,0),20);
    for(const c of cs){assert.equal(c.parameters.actor.properties.class,'scholar');assert.ok(!c.parameters.actor.temp);
        assert.equal(c.parameters.teaching_expectations[1].action,'kneel');assert.equal(c.parameters.teaching_expectations.length,3);}
    assert.throws(()=>ordination43Conditions({},p=>readTeaching43Source(p)+'\n'));
    assert.throws(()=>validateOrdination43Record({outcome:'observed',teaching:[]},cs[0]));
});
