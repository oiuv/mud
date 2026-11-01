import test from 'node:test';import assert from'node:assert/strict';
import{access43Conditions,validateAccess43Record}from'./teaching_43_access.mjs';import{readTeaching43Source}from'./teaching_43_contract.mjs';
test('finite original access flows keep random ask cost100; no prepared letter',()=>{const cs=access43Conditions({},readTeaching43Source);assert.equal(cs.length,3);assert.equal(cs.reduce((n,c)=>n+c.samples,0),300);for(const c of cs)assert.throws(()=>validateAccess43Record({teaching:[],outcome:'observed'},c));});
