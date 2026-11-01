import test from 'node:test';
import assert from 'node:assert/strict';
import {bookGift43Conditions,validateBookGift43Record} from './teaching_43_book_gifts.mjs';
import {readTeaching43Source} from './teaching_43_contract.mjs';
test('original no-clone book gifts exercise Dugu reward/repeat and both Huang return orders, never pregrant',()=>{
    const cs=bookGift43Conditions({},readTeaching43Source);assert.equal(cs.length,3);assert.equal(cs.reduce((n,c)=>n+c.samples,0),6);
    for(const c of cs){assert.equal(c.parameters.teaching_expectations.length,2);for(const k of c.parameters.monitored_grants)assert.ok(!Object.hasOwn(c.parameters.actor.properties,k));}
    assert.deepEqual(cs[1].parameters.teaching_expectations.map(s=>s.offer.id),['shangce','xiace']);
    assert.deepEqual(cs[2].parameters.teaching_expectations.map(s=>s.offer.id),['xiace','shangce']);
    assert.throws(()=>bookGift43Conditions({},p=>readTeaching43Source(p)+'\n'));
    assert.throws(()=>validateBookGift43Record({outcome:'observed',teaching:[]},cs[0]));
});
