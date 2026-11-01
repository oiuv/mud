import test from 'node:test';
import assert from 'node:assert/strict';
import {duplicate43Conditions,duplicate43Probe} from './teaching_43_duplicate_case.mjs';
import {recruitGateProbes} from './teaching_43_recruit_cases.mjs';
import {readTeaching43Source} from './teaching_43_contract.mjs';
test('duplicate case and recruit probes preserve every original byte and payload and both exact call identities',()=>{
    const path='kungfu/class/tiezhang/fen.c',source=readTeaching43Source(path);
    const sites=[...recruitGateProbes(source,path).sites,...duplicate43Probe(source,path).sites].sort((a,b)=>b.offset-a.offset);
    let text=source;for(const s of sites)text=text.slice(0,s.offset)+s.insert+text.slice(s.offset);
    for(const s of [...sites].reverse())text=text.slice(0,s.offset)+text.slice(s.offset+s.insert.length);
    assert.equal(text,source);assert.deepEqual(duplicate43Conditions({},readTeaching43Source)[0].parameters.duplicate_calls,[4837,5709]);
    assert.equal(duplicate43Conditions({},readTeaching43Source)[0].samples,2);
});
