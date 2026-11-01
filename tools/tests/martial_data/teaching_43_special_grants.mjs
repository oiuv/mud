import assert from 'node:assert/strict';
import { sha256, scanSource } from './inventory.mjs';

export const specialGrantGroup = 'teaching-43-special-grants';
const sources = {
    'kungfu/class/riyue/dongfang/dongfang.c': 'd9ba06f99b73807fd37f6597f9f9ec47a4f3d334bd3ec07e04b977d8498af6b2',
    'kungfu/class/yunlong/chen.c': 'c96fb9902bba509071b307ea1e6b76a4d6bcfebb771dc314ddaf10a842b6165b',
    'kungfu/class/ultra/huang.c': 'e2329b2abe80b477df9c4096a8157a7fc67c379b7a2bc25c6523872ee1ce2a14',
    'feature/skill.c': '99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
    'cmds/std/ask.c': '568ca1c612f6efda4af6ee54e2712a56ff7ba66aa44c42024978a06b5e5836c2',
};
export const specialGrantLessons = [
    ...[['无声无息','sheng',200,'dodge'],['无穷无尽','qiong',250,'force'],
        ['无边无际','po',260,'force'],['无法无天','tian',220,'force'],['无双无对','ws',400,'force']]
        .map(([topic,move,level,basic],i)=>({key:'dongfang-'+move,path:'kungfu/class/riyue/dongfang/dongfang.c',
            npc:'dongfang bubai',fn:'ask_skill'+(i+1),topic,skill:'kuihua-mogong',level,
            grant:`can_perform/${move==='po'?'pixie-jian':'kuihua-mogong'}/${move}`,
            rewards:[basic,'kuihua-mogong','martial-cognize'],variants:['grant','repeat','skill-low','guimai']})),
    {key:'chen-ji',path:'kungfu/class/yunlong/chen.c',npc:'chen jinnan',fn:'ask_me',topic:'疾电',
        skill:'ningxue-shenzhao',level:250,grant:'can_perform/ningxue-shenzhao/ji',rewards:['claw'],
        variants:['grant','repeat','skill-low','story-missing','shen-low']},
    {key:'huang-xin',path:'kungfu/class/ultra/huang.c',npc:'huang shang',fn:'ask_skill',topic:'摄心大法',
        skill:'jiuyin-shengong',level:240,grant:'can_perform/jiuyin-shengong/xin',
        rewards:['force','jiuyin-shengong','martial-cognize'],
        variants:['grant','repeat','skill-low','permission-missing','cognize-low','shou-missing','zhi-missing','zhua-missing','zhang-missing']},
];
const prerequisites = d => d.key==='chen-ji'?['story/shenzhao']:d.key==='huang-xin'
    ?['can_learn/jiuyin-shengong/xin',...['shou','zhi','zhua','zhang'].map(s=>'can_perform/jiuyin-shengong/'+s)]
    :['special_skill/guimai'];
function config(d,variant) {
    assert.ok(d.variants.includes(variant),'unreviewed special teaching variant');
    const props={'family/family_name':'无门无派',gender:'无性',str:30,con:30,int:30,dex:30,shen:1000000,
        gongxian:1000,combat_exp:10000000,neili:2000,max_neili:2000,jing:10000,eff_jing:10000,max_jing:10000,
        qi:10000,eff_qi:10000,max_qi:10000,potential:10000,learned_points:0};
    const skills={force:40,dodge:40,claw:40,'martial-cognize':d.key==='huang-xin'?240:20,[d.skill]:d.level};
    for(const key of prerequisites(d))props[key]=d.key.startsWith('dongfang-')?0:1;
    if(variant==='guimai'){props.gender='男性';props['special_skill/guimai']=1;}
    if(variant==='skill-low')skills[d.skill]--;
    if(variant==='story-missing')props['story/shenzhao']=0;
    if(variant==='shen-low')props.shen--;
    if(variant==='permission-missing')props['can_learn/jiuyin-shengong/xin']=0;
    if(variant==='cognize-low')skills['martial-cognize']--;
    if(/^(shou|zhi|zhua|zhang)-missing$/.test(variant))props['can_perform/jiuyin-shengong/'+variant.split('-')[0]]=0;
    const acquired=['grant','repeat','guimai'].includes(variant);
    const replies={'skill-low':d.key==='chen-ji'?'凝血神爪还不到家':d.key==='huang-xin'?'九阴神功火候还不够':'葵花魔功还不够娴熟',
        'story-missing':'打听这个干嘛','shen-low':'侠义方面','permission-missing':'上、','cognize-low':'武学修养不足',
        'shou-missing':'其他绝招领悟','zhi-missing':'其他绝招领悟','zhua-missing':'其他绝招领悟','zhang-missing':'其他绝招领悟'};
    const steps=[{grant:d.grant,value:acquired?1:0,contribution_spent:0,
        ...(replies[variant]?{response_contains:replies[variant]}:{})},
        ...(variant==='repeat'?[{grant:d.grant,value:1,contribution_spent:0}]:[])];
    return {actor:{skills,mappings:{},preparations:{},properties:props},steps,expected:acquired?'observed':'refused'};
}
export function specialGrantConditions(relations,readSource) {
    for(const [p,h]of Object.entries(sources))assert.equal(sha256(readSource(p)),h,'special teaching source drift: '+p);
    return specialGrantLessons.flatMap(d=>{
        const gs=relations.objects.find(t=>t.path===d.path)?.grants.filter(g=>g.function===d.fn&&g.grant===d.grant);
        assert.equal(gs?.length,1,'unique special grant declaration');const g=gs[0],h=sources[d.path];
        assert.equal(g.evidence.sha256,h);assert.equal(g.role,'player_grant_candidate');
        const f=scanSource(readSource(d.path)).functions.find(f=>f.name===d.fn);assert.ok(f);
        const entry={id:`${d.path}:${f.line}:${d.fn}`,path:d.path,sha256:h,function:d.fn,line:f.line,role:'teaching'};
        const paths=[...Object.keys(sources),`kungfu/skill/${d.skill}.c`,...d.rewards.map(s=>`kungfu/skill/${s}.c`)];
        return d.variants.map(variant=>{const c=config(d,variant);return {
            id:`teaching-43-special-${d.key}-${variant}`,stage:'school',method:'teaching',entry_id:entry.id,samples:2,
            status:'configured_not_executed',parameters:{collection_group:specialGrantGroup,teaching_profile:specialGrantGroup,
                lesson:d.key,variant,teacher:{path:'/'+d.path.slice(0,-2),id:d.npc,sha256:h},
                action:`ask ${d.npc} about ${d.topic}`,topic:d.topic,teaching_entry:entry,teaching_evidence:g.evidence,
                qualification_sources:paths,qualification_evidence:paths.map(path=>({path,sha256:sha256(readSource(path))})),
                actor:c.actor,target:{skills:{},mappings:{},properties:{}},monitored_grants:[d.grant,...prerequisites(d)],
                teaching_expectations:c.steps,expected:c.expected,fighting:false,observe_seconds:0,not_applicable:'',
                note:'原教师询问真实写入；前置许可/故事为明确实验输入，不冒称自然取得；黄裳使用原禁止克隆单例。'}};});
    });
}
export function validateSpecialGrantRecord(raw,condition) {
    const p=condition.parameters,d=specialGrantLessons.find(d=>d.key===p.lesson);assert.ok(d,'unknown special lesson');
    const c=config(d,p.variant);assert.equal(condition.id,`teaching-43-special-${d.key}-${p.variant}`);
    assert.equal(p.collection_group,specialGrantGroup);assert.equal(p.teaching_profile,specialGrantGroup);
    assert.deepEqual(p.teacher,{path:'/'+d.path.slice(0,-2),id:d.npc,sha256:sources[d.path]});
    assert.equal(p.teaching_entry.path,d.path);assert.equal(p.teaching_entry.function,d.fn);assert.equal(p.teaching_entry.sha256,sources[d.path]);
    assert.equal(p.action,`ask ${d.npc} about ${d.topic}`);assert.deepEqual(p.actor,c.actor);
    assert.deepEqual(p.monitored_grants,[d.grant,...prerequisites(d)]);assert.deepEqual(p.teaching_expectations,c.steps);
    for(const [path,hash]of Object.entries(sources))assert.ok(p.qualification_evidence.some(e=>e.path===path&&e.sha256===hash));
    assert.equal(p.expected,c.expected);assert.equal(raw.outcome,c.expected);assert.equal(raw.teaching.length,c.steps.length);
    assert.equal(raw.before[0].gender,c.actor.properties.gender);assert.equal(raw.after[0].gender,c.actor.properties.gender);
    for(const [i,s]of raw.teaching.entries()){
        assert.equal(s.student,raw.before[0].object);assert.equal(s.student,raw.after[0].object);
        if(i===0){assert.deepEqual(s.before.skills,c.actor.skills);assert.deepEqual(s.before.learned,{});}
        const skills={...s.before.skills},learned={...s.before.learned};
        if(i===0&&c.expected==='observed')for(const skill of d.rewards){
            const level=skills[skill];assert.ok(level**3/10<=10000000);assert.ok(Math.trunc((d.key==='chen-ji'?250000:1500000)*100/(level+100))>(level+1)**2);
            skills[skill]++;learned[skill]=0;
        }
        assert.deepEqual(s.after.skills,skills);assert.deepEqual(s.after.learned,learned);
        for(const key of prerequisites(d))assert.equal(s.after.grants[key],c.actor.properties[key]);
        for(const key of ['neili','max_neili','mappings','max_jingli','potential','learned_points','family','master_id','master_name','shen','str','int','con','dex','combat_exp'])
            assert.deepEqual(s.after[key],s.before[key]);
    }
}
