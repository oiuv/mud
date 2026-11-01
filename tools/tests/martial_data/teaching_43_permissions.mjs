// Actual no_teach callback acquisition through the original learn command.
import assert from 'node:assert/strict';
import {scanSource,sha256} from './inventory.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
let canonical;
export const permission43Group='teaching-43-permissions';
export const permission43Lessons=[
    ['hu/hufei','hu fei','胡斐','关外胡家',8,'baisheng-daofa','try_to_learn_baishengdao','can_learn/hufei/baisheng-daofa',100000,200,600,{blade:60}],
    ['hu/hufei','hu fei','胡斐','关外胡家',8,'hujia-daofa','try_to_learn_hujiadao','can_learn/hufei/hujia-daofa',400000,300,1400,{blade:120}],
    ['hu/hufei','hu fei','胡斐','关外胡家',8,'sixiang-bufa','try_to_learn_sixiangbu','can_learn/hufei/sixiang-bufa',50000,40,100,{}],
    ['miao/miao','miao renfeng','苗人凤','中原苗家',7,'miaojia-jian','try_to_learn_miaojiajian','can_learn/miao/miaojia-jian',400000,300,1300,{sword:120}],
    ['miao/miao','miao renfeng','苗人凤','中原苗家',7,'tianlong-jian','try_to_learn_tianlongjian','can_learn/miao/tianlong-jian',120000,140,500,{sword:50}],
    ['riyue/ren','ren woxing','任我行','日月神教',14,'xixing-dafa','try_to_learn_xixingdafa','can_learn/xixing-dafa/ren',null,181,100,{}],
    ['shang/tai','shang laotai','商老太','商家堡',4,'wai-bagua','try_to_learn_waibagua','can_learn/shanglaotai/wai-bagua',100000,40,100,{'bagua-bu':100,'bagua-quan':100,'bagua-zhang':100,parry:100}],
].map(([file,npc,name,family,generation,skill,fn,permission,exp,force,max_neili,skills])=>({file,npc,name,family,generation,skill,fn,permission,exp,force,max_neili,skills}));
const hashes={
    'kungfu/class/hu/hufei.c':'538be69d07e3c9ab4bbd1d6e105c31c79129782a15fbdeef541ac6255768ed41',
    'kungfu/class/miao/miao.c':'acf54cc38b0713d8daa568b7a7967d49b987b8cc37c800613b96b9ea1a36fa2a',
    'kungfu/class/riyue/ren.c':'7185eee115a1b22a7a52370d55838e082d881c5c9ed0cdc504e6a0755e27d0b8',
    'kungfu/class/shang/tai.c':'d42316ea5c95c4b8f2b7b765a92ccb837ef90a1505687512a780743257239a66',
    'cmds/skill/learn.c':'cb090d891b2bcfe93eefb34931f6e7b81be37f4ffd3c9ed6e475bc08ad041e6b',
    'feature/skill.c':'99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
    'feature/apprentice.c':'d45dbb167fa87c5bcea3c43e1c9f1350f21570bbb3d77ab0e67fb7cd5b0f6c75',
};
function actor(d,variant){
    assert.ok(['acquire','boundary'].includes(variant),'unknown permission variant');
    return {skills:{force:d.force-(d.exp===null&&variant==='boundary'?1:0),dodge:40,parry:40,[d.skill]:50,...d.skills},
        mappings:{},preparations:{},properties:{name:'试武甲',gender:'男性',character:'心狠手辣',str:30,con:30,int:34,dex:30,
            'family/family_name':d.family,'family/master_id':d.npc,'family/master_name':d.name,'family/generation':d.generation,
            combat_exp:d.exp===null?1000000:d.exp+(variant==='acquire'?1:0),shen:0,gongxian:100,
            potential:10000,learned_points:0,jing:10000,eff_jing:10000,max_jing:10000,
            qi:10000,eff_qi:10000,max_qi:10000,neili:d.max_neili,max_neili:d.max_neili}};
}
export function permission43SourceBindings(readSource){
    return {objects:[...new Set(permission43Lessons.map(d=>d.file))].map(file=>{
        const path=`kungfu/class/${file}.c`,source=readSource(path),scan=scanSource(source);
        return {path,learning_permissions:permission43Lessons.filter(d=>d.file===file).map(d=>{
            const fn=scan.functions.find(f=>f.name===d.fn),text=`set("${d.permission}", 1)`;
            assert.ok(fn);assert.equal(fn.text.split(text).length,2,'reviewed setter must be unique');
            const start=fn.start+fn.text.indexOf(text),end=start+text.length;
            return {permission:d.permission,function:d.fn,evidence:{path,sha256:sha256(source),line:source.slice(0,start).split('\n').length,start,end,text}};
        })};
    })};
}
export function permission43Conditions(relations,readSource){
    for(const [p,h]of Object.entries(hashes))assert.equal(sha256(readSource(p)),h,'learning permission source drift: '+p);
    return permission43Lessons.flatMap(d=>{
        const path=`kungfu/class/${d.file}.c`,source=readSource(path),hash=hashes[path],f=scanSource(source).functions.find(f=>f.name===d.fn);
        assert.ok(f);const ps=relations.objects.find(t=>t.path===path)?.learning_permissions.filter(p=>p.permission===d.permission&&p.function===d.fn);
        assert.equal(ps?.length,1,'unique permission setter required');const setter=ps[0];assert.equal(setter.evidence.sha256,hash);
        const entry={id:`${path}:${f.line}:${d.fn}`,path,sha256:hash,function:d.fn,line:f.line,role:'teaching'};
        const paths=[...Object.keys(hashes),`kungfu/skill/${d.skill}.c`,'inherit/skill/skill.c','inherit/skill/force.c'];
        return ['acquire','boundary'].map(variant=>({id:`teaching-43-permission-${d.skill}-${variant}`,stage:'school',method:'teaching',entry_id:entry.id,
            samples:variant==='acquire'?100:2,status:'configured_not_executed',parameters:{collection_group:permission43Group,teaching_profile:permission43Group,
                teaching_kind:'ordinary_learning',teacher:{path:'/'+path.slice(0,-2),id:d.npc,sha256:hash},
                teacher_level:scanSource(source).calls.find(c=>c.function==='create'&&c.name==='set_skill'&&c.args[0]?.value===d.skill)?.args[1]?.value,
                skill:d.skill,variant,action:`learn ${d.npc} ${d.skill} 1`,teaching_entry:entry,teaching_evidence:setter.evidence,
                monitored_grants:[d.permission],teaching_expectations:[{command_kind:'learn'}],actor:actor(d,variant),
                target:{skills:{},mappings:{},properties:{}},named_participants:true,expected:variant==='acquire'?'observed':'refused',
                qualification_sources:paths,qualification_evidence:paths.map(path=>({path,sha256:sha256(readSource(path))})),
                fighting:false,observe_seconds:0,not_applicable:'',note:'原learn触发no_teach回调，核许可0→1与实际学习；既有师承/基础为显式输入，不预写许可。'}}));
    });
}
export function validatePermission43Record(raw,c){
    canonical??=new Map(permission43Conditions(permission43SourceBindings(readTeaching43Source),readTeaching43Source).map(c=>[c.id,c]));
    assertTeaching43Contract(c,canonical.get(c.id));
    const p=c.parameters,d=permission43Lessons.find(d=>d.skill===p.skill);assert.ok(d,'unreviewed permission lesson');
    const path=`kungfu/class/${d.file}.c`,input=actor(d,p.variant),success=p.variant==='acquire';
    assert.equal(p.collection_group,permission43Group);assert.equal(p.teaching_profile,permission43Group);assert.equal(c.method,'teaching');
    assert.equal(c.id,`teaching-43-permission-${d.skill}-${p.variant}`);assert.deepEqual(p.actor,input);
    assert.deepEqual(p.teacher,{path:'/'+path.slice(0,-2),id:d.npc,sha256:hashes[path]});
    assert.equal(p.teaching_entry.function,d.fn);assert.equal(p.teaching_entry.path,path);assert.equal(p.teaching_entry.sha256,hashes[path]);
    assert.equal(p.action,`learn ${d.npc} ${d.skill} 1`);assert.deepEqual(p.monitored_grants,[d.permission]);
    for(const [path,hash]of Object.entries(hashes))assert.ok(p.qualification_evidence.some(e=>e.path===path&&e.sha256===hash));
    assert.equal(raw.kind,'sample');assert.equal(raw.method,'teaching');assert.equal(raw.condition_id,c.id);
    assert.equal(raw.outcome,success?'observed':'refused');assert.equal(p.expected,raw.outcome);assert.equal(raw.teaching.length,1);
    const s=raw.teaching[0],b=s.before,a=s.after;
    assert.equal(s.command,p.action);assert.equal(s.command_accepted,1);assert.equal(s.teacher_program,p.teacher.path);
    assert.match(s.teacher.slice(p.teacher.path.length),/^#\d+$/);assert.ok(s.teacher.startsWith(p.teacher.path));
    assert.equal(s.teacher_skills[d.skill],p.teacher_level);assert.equal(s.teacher_no_teach.kind,'expression');
    assert.equal(s.student,raw.before[0].object);assert.equal(s.student,raw.after[0].object);assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0);
    assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');assert.ok(Array.isArray(s.messages));
    for(const [k,v]of Object.entries(input.skills))assert.equal(b.skills[k],v);assert.deepEqual(b.skills,input.skills);assert.deepEqual(b.learned,{});
    assert.deepEqual(b.grants,{[d.permission]:0});assert.deepEqual(a.grants,{[d.permission]:success?1:0});
    for(const [key,property]of [['family','family/family_name'],['master_id','family/master_id'],['master_name','family/master_name']]){
        assert.equal(b[key],input.properties[property]);assert.equal(a[key],b[key]);
    }
    for(const k of ['str','con','int','dex','combat_exp','shen','jing','neili','max_neili','potential','learned_points'])assert.equal(b[k],input.properties[k]);
    assert.equal(b.character,input.properties.character);assert.equal(b.effective_int,34);assert.equal(b.effective_force,Math.trunc(input.skills.force/2));
    const learned={...b.learned};
    if(success){
        const gain=(a.learned[d.skill]??0)-(b.learned[d.skill]??0);assert.ok(Number.isSafeInteger(gain)&&gain>=3&&gain<=17,'learn proficiency must follow original RNG and improve_skill conversion');
        learned[d.skill]=gain;
    }
    assert.deepEqual(a.learned,learned);assert.deepEqual(a.skills,b.skills);assert.deepEqual(a.mappings,{});assert.deepEqual(b.mappings,{});
    assert.equal(b.jing-a.jing,success?5:0);assert.equal(a.learned_points,b.learned_points+(success?1:0));
    for(const k of ['neili','max_neili','max_jingli','potential','str','con','int','dex','combat_exp','shen','character','contribution'])assert.deepEqual(a[k],b[k]);
    assert.equal(b.contribution,input.properties.gongxian);
    for(const [state,point]of [['before',b],['after',a]])for(const k of ['skills','learned','mappings','jing','neili','max_neili','str'])assert.deepEqual(raw[state][0][k],point[k]);
    assert.equal(raw.before[0].gender,input.properties.gender);assert.equal(raw.after[0].gender,input.properties.gender);
    assertTeaching43Counters(raw.metrics?.[0],{jing_cost:success?5:0});
    assertTeaching43Snapshots(raw,b,a,c);
    assert.equal(s.skill_after_command,50,'real original target skill after command');
    return [{advanced:success,acquired:success,command_kind:'learn',jing_spent:success?5:0,contribution_spent:0}];
}
