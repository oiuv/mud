import assert from 'node:assert/strict';
import {scanSource,sha256} from './inventory.mjs';
import {book43Data} from './teaching_43_books_data.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
export const book43Group='teaching-43-books';
let canonical;
const support=['cmds/std/ask.c','cmds/skill/study.c','cmds/skill/learn.c','feature/skill.c','inherit/item/book.c'];
export function book43Conditions(relations,readSource){
    assert.equal(book43Data.length,21);
    return book43Data.map(d=>{
        const source=readSource(d.entry.path);assert.equal(sha256(source),d.entry.sha256);
        const fn=scanSource(source).functions.find(f=>f.name===d.entry.function);
        assert.ok(fn&&fn.start===d.entry.start&&fn.end===d.entry.end);
        const paths=[...new Set([d.entry.path,...support,...d.books.flatMap(b=>[b.path.slice(1)+'.c','kungfu/skill/'+b.skill+'.c'])])];
        const evidence=paths.map(path=>({path,sha256:sha256(readSource(path))}));
        for(const b of d.books)assert.equal(evidence.find(e=>e.path===b.path.slice(1)+'.c').sha256,b.sha256);
        const entry={id:d.entry.path+':'+d.entry.line+':'+d.entry.function,...d.entry,role:'teaching'};
        const body=source.slice(fn.start,fn.end);
        // Gou Du's original wuya/suxinghe singleton branch returns before the
        // later ordinary random-book stock decrement in the same function.
        const stockDeltas=d.key.endsWith('-unique-lunyu')?[]:[...body.matchAll(/add\(\s*"(book_count|music_book)"\s*,\s*(-?\d+)\s*\)/g)].map(m=>({key:m[1],delta:+m[2]}));
        return {id:'teaching-43-books-'+d.key,stage:'school',method:'teaching',entry_id:entry.id,
            samples:d.books.length>1||d.books.some(b=>b.jing_range[0]!==b.jing_range[1])?100:2,status:'configured_not_executed',parameters:{
                collection_group:book43Group,teaching_profile:book43Group,teaching_kind:'textbook-study',lesson:d.key,
                teacher:d.teacher,teaching_entry:entry,teaching_evidence:d.entry,action:d.action,topic:d.action.split(' about ')[1],
                actor:d.actor,target:{skills:{},mappings:{},properties:{}},named_participants:true,monitored_grants:[],
                qualification_sources:paths,qualification_evidence:evidence,books:d.books,stock_deltas:stockDeltas,
                teaching_expectations:[{action:d.action,command_kind:'ask'},{command_kind:'study',resolve:'actual_acquired_book'}],
                fighting:false,observe_seconds:0,expected:'observed',not_applicable:'',
                note:'原教师原询问取得实际教材，再按实际别名执行原study；不预造书、不强移书、不重抽随机。资质和师承为明示实验输入。'}};
    });
}
export function validateBook43Record(raw,c){
    canonical??=new Map(book43Conditions({},readTeaching43Source).map(c=>[c.id,c]));assertTeaching43Contract(c,canonical.get(c.id));
    const p=c.parameters;assert.equal(raw.outcome,'observed');assert.equal(raw.teaching.length,2);
    const [ask,study]=raw.teaching,initial=ask.before;
    assert.deepEqual(initial.skills,p.actor.skills);assert.deepEqual(initial.learned,{});assert.deepEqual(initial.mappings,{});assert.deepEqual(initial.grants,{});
    assert.equal(initial.character,p.actor.properties.character);
    for(const [key,field]of [['family','family_name'],['master_id','master_id'],['master_name','master_name']])
        assert.equal(initial[key]??0,p.actor.properties.family?.[field]??0,'actual prepared teacher affiliation: '+key);
    for(const point of raw.teaching.flatMap(s=>[s.before,s.after])){
        assert.equal(point.effective_int,point.int+Math.trunc((point.skills.literate??0)/10));
        assert.equal(point.effective_dex,point.dex+Math.trunc((point.skills.dodge??0)/10));
        assert.equal(point.effective_force,Math.trunc((point.skills.force??0)/2));
        assert.equal(point.effective_dodge,Math.trunc((point.skills.dodge??0)/2));
    }
    for(const key of ['jing','neili','max_neili','max_jingli','str','int','con','dex','combat_exp','potential','learned_points'])assert.equal(initial[key],p.actor.properties[key]);
    assert.equal(ask.teacher_program,p.teacher.path);assert.ok(ask.teacher.startsWith(p.teacher.path+'#'));assert.match(ask.teacher.slice(p.teacher.path.length),/^#\d+$/);
    assert.equal(ask.command,p.action);assert.equal(ask.command_accepted,1);assert.equal(study.command_accepted,1);
    const acquired=ask.book_after.items.filter(b=>b.environment===raw.before[0].object);
    assert.equal(acquired.length,1,'one actual newly acquired source book');const book=acquired[0];
    const definition=p.books.find(b=>b.path===book.program);assert.ok(definition,'source-qualified original textbook');
    assert.equal(book.clonep,definition.clonep);assert.equal(book.id,definition.id);
    if(book.clonep){assert.ok(book.object.startsWith(book.program));assert.match(book.object.slice(book.program.length),/^#\d+$/);}
    else assert.equal(book.object,book.program,'original singleton must not acquire a fake clone identity');
    const bookSource=readTeaching43Source(definition.path.slice(1)+'.c');assert.equal(sha256(bookSource),definition.sha256);
    const weights=[...bookSource.matchAll(/set_weight\(\s*(\d+)\s*\)/g)];assert.equal(weights.length,1);assert.equal(book.weight,+weights[0][1]);
    assert.ok(!ask.book_before.items.some(b=>b.environment===raw.before[0].object),'book must not be pre-held');
    assert.equal(book.skill.name,definition.skill);
    for(const [key,value]of Object.entries(definition.fields))if(key!=='jing_cost')assert.equal(book.skill[key]??0,parseInt(value,10),'actual book field: '+key);
    assert.ok(Number.isSafeInteger(book.skill.jing_cost)&&book.skill.jing_cost>=definition.jing_range[0]&&book.skill.jing_cost<=definition.jing_range[1]);
    assert.deepEqual(book.owner_chain,[raw.before[0].object,'/tests/runner']);
    assert.equal(study.resolved_book,book.object);assert.equal(study.command,'study '+definition.id+' 1');
    assert.equal(study.teacher,'none');assert.equal(study.teacher_program,'none');
    assert.deepEqual(study.before,ask.after,'no reset between actual acquisition and reading');
    assert.deepEqual(study.book_before,ask.book_after);assert.deepEqual(study.book_after,study.book_before,'study does not replace/consume or reroll book');
    assert.ok(Number.isSafeInteger(initial.jing-ask.after.jing)&&initial.jing-ask.after.jing>=10&&initial.jing-ask.after.jing<=19);
    const askExpected=structuredClone(initial);askExpected.jing=ask.after.jing;assert.deepEqual(ask.after,askExpected);
    const skill=definition.skill,level=study.before.skills[skill]??0,input=Math.trunc(study.before.skills.literate/10)+1;
    const gain=1+Math.trunc(input*100/(level+100)),upgraded=gain>(level+1)**2;
    const cost=Math.max(10,Math.trunc((book.skill.jing_cost*20+book.skill.difficulty-study.before.effective_int)/20));
    const expected=structuredClone(study.before);expected.jing-=cost;expected.learned[skill]=upgraded?0:gain;expected.skills[skill]=level+Number(upgraded);
    assert.deepEqual(study.after,expected,'actual read progress/cost and only that skill');
    for(const s of raw.teaching){assert.equal(s.student,raw.before[0].object);assert.ok(s.elapsed>=0&&s.elapsed<=raw.elapsed);assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');}
    const teacherSource=readTeaching43Source(p.teacher.path.slice(1)+'.c'),scan=scanSource(teacherSource),create=scan.functions.find(f=>f.name==='create');assert.ok(create);
    const initialStock={book_count:0,music_book:0};
    for(const m of teacherSource.slice(create.start,create.end).matchAll(/set\(\s*"(book_count|music_book)"\s*,\s*(\d+)\s*\)/g))initialStock[m[1]]=+m[2];
    assert.deepEqual(ask.book_before.stock,initialStock,'source original initial stock');
    const stock={...initialStock};for(const {key,delta}of p.stock_deltas)stock[key]+=delta;
    const fn=scan.functions.find(f=>f.name===p.teaching_entry.function);assert.ok(fn);
    for(const m of teacherSource.slice(fn.start,fn.end).matchAll(/set\(\s*"(book_count|music_book)"\s*,\s*(\d+)\s*\)/g))stock[m[1]]=+m[2];
    assert.deepEqual(ask.book_after.stock,stock,'whole stock must reflect the executed original branch, including set()');
    assert.deepEqual(raw.book_cleanup,Object.fromEntries(p.books.map(b=>[b.path,0])));
    assertTeaching43Counters(raw.metrics[0],{jing_cost:initial.jing-study.after.jing});
    assertTeaching43Snapshots(raw,initial,study.after,c);
    for(const state of [raw.before[0],raw.after[0]]){
        assert.equal(state.cultivation['family/family_name']??0,p.actor.properties.family?.family_name??0);
        assert.equal(state.cultivation.class,p.actor.properties.class);
    }
    return [{advanced:true,acquired:true,command_kind:'ask',jing_spent:initial.jing-ask.after.jing},
        {advanced:true,acquired:false,command_kind:'study',jing_spent:cost}];
}
