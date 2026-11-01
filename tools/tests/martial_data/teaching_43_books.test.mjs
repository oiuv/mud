import test from 'node:test';
import assert from 'node:assert/strict';
import {book43Conditions,validateBook43Record} from './teaching_43_books.mjs';
import {readTeaching43Source} from './teaching_43_contract.mjs';
import {validatorFor} from './collection_review.mjs';
import {readFileSync} from 'node:fs';
import {validateRecord} from './execution.mjs';
const conditions=()=>book43Conditions({},readTeaching43Source);
test('21 exact source-reviewed textbook routes; random branch/cost cohorts retain100 samples',()=>{
    const cs=conditions();assert.equal(cs.length,21);assert.equal(new Set(cs.map(c=>c.id)).size,21);
    for(const c of cs){assert.equal(c.parameters.actor.skills.literate,100);assert.equal(c.parameters.teaching_expectations[1].resolve,'actual_acquired_book');
        assert.equal(c.samples,c.parameters.books.length>1||c.parameters.books.some(b=>b.jing_range[0]!==b.jing_range[1])?100:2);}
    assert.throws(()=>book43Conditions({},p=>readTeaching43Source(p)+'\n'));
    assert.deepEqual(cs.find(c=>c.id.endsWith('-unique-lunyu')).parameters.stock_deltas,[]);
    assert.deepEqual(cs.find(c=>c.id.endsWith('-other-mentor-random')).parameters.stock_deltas,[{key:'book_count',delta:-1}]);
});

const goldens=JSON.parse(readFileSync(new URL('./fixtures/teaching43_books_goldens.json',import.meta.url),'utf8')).rows;
function validate(row){validateRecord(row.raw,row.condition);validateBook43Record(row.raw,row.condition);}
test('four actual frozen originals pass full record validation and current book semantics',()=>{
    assert.equal(goldens.length,4);for(const row of goldens)validate(row);
});
test('stock, affiliation, character, effective intelligence, book identity/weight and cleanup mutations reject',()=>{
    for(const source of goldens){
        for(const mutate of [r=>{r.raw.teaching[0].book_after.stock.music_book+=800;},
            r=>{r.raw.book_cleanup[r.condition.parameters.books[0].path]=1;},
            r=>{for(const s of r.raw.teaching)for(const p of [s.before,s.after])p.effective_int=10000;},
            r=>{for(const s of r.raw.teaching)for(const p of [s.before,s.after])p.character='光明磊落';},
            r=>{for(const s of r.raw.teaching)for(const p of [s.before,s.after])p.family='武当派';},
            r=>{for(const s of r.raw.teaching)for(const p of [s.book_before,s.book_after])for(const b of p.items)b.weight=0;}]){
            const r=structuredClone(source);mutate(r);assert.throws(()=>validate(r));
        }
    }
    const original=goldens[0],r=structuredClone(original),old=r.raw.teaching[0].book_after.items[0].object;
    r.raw=JSON.parse(JSON.stringify(r.raw).split(old).join('/invented/book#9'));assert.throws(()=>validate(r));
    const unique=structuredClone(goldens.find(r=>r.condition.id.endsWith('-unique-lunyu')));
    for(const s of unique.raw.teaching)for(const point of [s.book_before,s.book_after])if(point===unique.raw.teaching[0].book_before)continue;else point.stock.book_count=0;
    assert.throws(()=>validate(unique));
});
test('book route uses dedicated current consumer and refuses invented acquisition/state records',async()=>{
    const c=conditions()[0],validate=await validatorFor(c);assert.equal(typeof validate,'function');
    for(const raw of [{outcome:'refused'},{outcome:'observed',teaching:[]}])assert.throws(()=>validateBook43Record(raw,c));
    const changed=structuredClone(c);changed.parameters.actor.properties['can_learn/fake']=1;
    assert.throws(()=>validateBook43Record({outcome:'observed',teaching:[]},changed));
});
