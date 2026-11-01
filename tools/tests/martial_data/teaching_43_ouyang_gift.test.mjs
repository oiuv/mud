import test from 'node:test';
import assert from 'node:assert/strict';
import {ouyangGift43Conditions,validateOuyangGift43Record} from './teaching_43_ouyang_gift.mjs';
import {readTeaching43Source} from './teaching_43_contract.mjs';
test('original adult NPC gift uses get/give, not injected permission; random counter requires100',()=>{
    const [c]=ouyangGift43Conditions({},readTeaching43Source);assert.equal(c.samples,100);assert.equal(c.parameters.actor.properties['can_learn/lingshe-quan/count'],10);
    assert.ok(!Object.hasOwn(c.parameters.actor.properties,'can_learn/lingshe-quan/ke'));assert.throws(()=>validateOuyangGift43Record({outcome:'observed',teaching:[]},c));
});
