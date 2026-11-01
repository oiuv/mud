import assert from 'node:assert/strict';
import { sha256, scanSource } from './inventory.mjs';

export const jueqingGrantGroup = 'teaching-43-jueqing-grants';
const teacherHashes = {
    fan: 'c1d317d965ca617f2953621c38150596eddbfd0dd7776f67afdf3d5d9759d83d',
    zhi: '1d1dfe01c1d55589da24603b51f6dfafcfabfc18ed9c6622b27c04a44104bc5f',
};
const supportHashes = {
    'adm/daemons/masterd.c': '32b6b5667152b09a902ce4ed7798c0538810a2f9030c1854b508717ad5f5ae95',
    'feature/skill.c': '99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
    'inherit/skill/skill.c': '891da821f84c26820c1e540822dba751f218441cc03f2b95a1fcfcc3923294cd',
    'cmds/std/ask.c': '568ca1c612f6efda4af6ee54e2712a56ff7ba66aa44c42024978a06b5e5836c2',
    'kungfu/skill/jueqing-jian.c': 'd865f39e811f933a850b24e6176d7dd4a1fe30d06b941324ea9987cd1213bd8c',
    'kungfu/skill/tianjue-dao.c': '7e3422c1122a02a07c9297a55303153fb9754bc8a98e1287602ad79b1f8ef6c8',
    'kungfu/skill/pokong-quan.c': 'dbc50c58bfba33540def561f9f40162811e4b07e69b3e4ed204c9f265db9468b',
    'kungfu/skill/jueqing-zhang.c': '23d6737551f632727b1479a27ba47cec746e3f1cd176925c12e40178534337e3',
    'kungfu/skill/guxing-jian.c': 'ca36e996dbd68762b94bf4c540d589ecf99df6ed55c7f01ad568357319350413',
    'kungfu/skill/luoyun-dao.c': '084b0827f928f1210f2ff6d4e2ba7c9302ff5bc84605c0fcebd4ce4e784ebb0f',
    'kungfu/skill/guhong-zhang.c': 'e6875bc4da0d347f14638541c12e629c12781652654c57bc5fa2ef10b22f8bd2',
    'kungfu/skill/poshui-zhang.c': '419f12f005772fb28b448d7a94597554e96c5a4ab9ce137b7388d85ee93e5cb5',
    'kungfu/skill/zilei-jian.c': 'a7e33dcc9f9a54b267e29093c8044c93e2d32b1c4c281d9f4c9ee16eebe9b16b',
    'kungfu/skill/poguang-dao.c': '4e4194d187d4dd94111ea6398834c2210db1a386c0428249117ec3874aeabf83',
    'kungfu/skill/yinyang-ren.c': '62dcfeade807dd98f3f5fd20f0801c99ce72986dad416d87c17ac3dfcf69c321',
};
// file, topic, skill, ability, raw level, contribution, negative-shen limit, effective force/dodge.
export const jueqingGrantLessons = [
    ['fan','流水无情','jueqing-jian','liu',60,80,-4000,60,0],
    ['fan','天绝锁','tianjue-dao','suo',40,100,-4000,0,0],
    ['fan','破碎虚空','pokong-quan','kong',50,100,-4000,70,0],
    ['fan','万念惧灰','jueqing-zhang','wan',100,120,-8000,0,80],
    ['fan','九星连珠','guxing-jian','lian',80,180,-12000,60,0],
    ['fan','天刀落云式','luoyun-dao','tian',80,180,-12000,60,0],
    ['fan','千山孤鸿影','guhong-zhang','qian',80,220,-12000,100,0],
    ['fan','泰山压顶','poshui-zhang','tai',120,300,-18000,160,0],
    ['zhi','落雷式','zilei-jian','luo',100,400,-60000,120,0],
    ['zhi','狂风式','zilei-jian','feng',100,400,-45000,0,140],
    ['zhi','破阳刀','poguang-dao','yang',100,400,-60000,120,0],
    ['zhi','寒冰环','poguang-dao','bing',100,400,-45000,140,0],
    ['zhi','魂飞魄散','jueqing-zhang','hun',120,500,-92000,160,0],
    ['zhi','日月无华','yinyang-ren','hua',160,600,-35000,0,0],
    ['zhi','横空出世','yinyang-ren','heng',180,700,-100000,180,180],
    ['zhi','阴阳环','yinyang-ren','huan',180,600,-120000,0,200],
].map(([file,topic,skill,move,level,cost,shen,force,dodge]) => ({file,topic,skill,move,level,cost,shen,force,dodge,
    key:`${file}-${move}`,npc:file==='fan'?'fan yiweng':'gongsun zhi'}));
const basicTypes = {
    'jueqing-jian':['sword','parry'], 'tianjue-dao':['blade','parry'], 'pokong-quan':['cuff','parry'],
    'jueqing-zhang':['strike','parry'], 'guxing-jian':['sword','parry'], 'luoyun-dao':['blade','parry'],
    'guhong-zhang':['strike','parry'], 'poshui-zhang':['staff','parry'], 'zilei-jian':['sword','parry'],
    'poguang-dao':['blade','parry'], 'yinyang-ren':['sword','blade','parry'],
};
const keyFor = d => `can_perform/${d.skill}/${d.move}`;
const variants = d => ['grant','repeat','family-other','skill-zero','skill-low','contribution-low','shen-high',
    ...(d.force?['force-low']:[]),...(d.dodge?['dodge-low']:[])];
function config(d,variant) {
    assert.ok(variants(d).includes(variant),'unreviewed Jueqing variant');
    const actor={skills:{[d.skill]:d.level,...Object.fromEntries(basicTypes[d.skill].map(s=>[s,40])),
        force:d.force?d.force*2:200,dodge:d.dodge?d.dodge*2:40,'martial-cognize':20},
        mappings:{},preparations:{},properties:{'family/family_name':'绝情谷',str:30,con:30,int:30,dex:30,
            shen:d.shen,gongxian:d.cost,combat_exp:10000000,neili:2000,max_neili:2000,
            jing:10000,eff_jing:10000,max_jing:10000,qi:10000,eff_qi:10000,max_qi:10000,
            potential:10000,learned_points:0}};
    if(variant==='family-other')actor.properties['family/family_name']='武当派';
    if(variant==='skill-zero')actor.skills[d.skill]=0;
    if(variant==='skill-low')actor.skills[d.skill]--;
    if(variant==='contribution-low')actor.properties.gongxian--;
    if(variant==='shen-high')actor.properties.shen++;
    if(variant==='force-low')actor.skills.force--;
    if(variant==='dodge-low')actor.skills.dodge--;
    const acquired=['grant','repeat'].includes(variant),replies={
        'family-other':'素无渊源','skill-zero':'何谈绝招可言','skill-low':'了解还不够',
        'contribution-low':'作出的贡献不够','shen-high':'心慈手软','force-low':'内功火候不足','dodge-low':'轻功火候不足'};
    const first={grant:keyFor(d),value:acquired?1:0,contribution_spent:acquired?d.cost:0,
        ...(replies[variant]?{response_contains:replies[variant]}:{})};
    return {actor,expected:acquired?'observed':'refused',steps:[first,
        ...(variant==='repeat'?[{grant:keyFor(d),value:1,contribution_spent:0}]:[])]};
}
export function jueqingGrantConditions(relations,readSource) {
    for(const [path,hash]of Object.entries(supportHashes))assert.equal(sha256(readSource(path)),hash,'changed Jueqing support: '+path);
    return jueqingGrantLessons.flatMap(d=>{
        const path=`kungfu/class/jueqing/${d.file}.c`,hash=teacherHashes[d.file],source=readSource(path);
        assert.equal(sha256(source),hash,'changed Jueqing teacher: '+path);
        const gs=relations.objects.find(t=>t.path===path)?.grants.filter(g=>g.function==='accept_ask'&&g.grant===keyFor(d));
        assert.equal(gs?.length,1,'exact Jueqing declaration required');const g=gs[0];
        assert.equal(g.operation,'teach_pfm');assert.equal(g.role,'player_grant_candidate');assert.equal(g.evidence.sha256,hash);
        const fields={perform:keyFor(d),name:d.topic,sk1:d.skill,lv1:d.level,gongxian:d.cost,shen:d.shen,
            ...(d.force?{force:d.force}:{}),...(d.dodge?{dodge:d.dodge}:{})};
        assert.deepEqual(Object.fromEntries(Object.entries(g.fields).filter(([k])=>k!=='msg1').map(([k,v])=>[k,v.value])),fields);
        const f=scanSource(source).functions.find(f=>f.name==='accept_ask');assert.ok(f);
        const entry={id:`${path}:${f.line}:accept_ask`,path,sha256:hash,function:'accept_ask',line:f.line,role:'teaching'};
        const paths=[path,...Object.keys(supportHashes),'kungfu/skill/martial-cognize.c',
            ...[...new Set([...basicTypes[d.skill],'dodge','force'])].map(s=>`kungfu/skill/${s}.c`)];
        const evidence=paths.map(path=>({path,sha256:sha256(readSource(path))}));
        return variants(d).map(variant=>{const cfg=config(d,variant),action=`ask ${d.npc} about ${d.topic}`;
            return {id:`teaching-43-jueqing-${d.key}-${variant}`,stage:'school',method:'teaching',entry_id:entry.id,
                samples:2,status:'configured_not_executed',parameters:{collection_group:jueqingGrantGroup,
                    teaching_profile:jueqingGrantGroup,lesson:d.key,variant,teacher:{path:'/'+path.slice(0,-2),id:d.npc,sha256:hash},
                    action,topic:d.topic,teaching_entry:entry,teaching_evidence:g.evidence,
                    qualification_sources:paths,qualification_evidence:evidence,actor:cfg.actor,
                    target:{skills:{},mappings:{},properties:{}},monitored_grants:[keyFor(d)],
                    teaching_expectations:cfg.steps,expected:cfg.expected,fighting:false,observe_seconds:0,not_applicable:'',
                    note:'按原询问和MASTER_D采许可、负神上限、固定贡献与完整奖励；门派/武学是实验输入，不冒称自然养成或施展。'}};});
    });
}
export function validateJueqingGrantRecord(raw,condition) {
    const p=condition.parameters,d=jueqingGrantLessons.find(d=>d.key===p.lesson);assert.ok(d,'unknown Jueqing lesson');
    const cfg=config(d,p.variant),path=`kungfu/class/jueqing/${d.file}.c`;
    assert.equal(condition.id,`teaching-43-jueqing-${d.key}-${p.variant}`);assert.equal(condition.method,'teaching');
    assert.equal(p.collection_group,jueqingGrantGroup);assert.equal(p.teaching_profile,jueqingGrantGroup);
    assert.deepEqual(p.teacher,{path:'/'+path.slice(0,-2),id:d.npc,sha256:teacherHashes[d.file]});
    assert.equal(p.teaching_entry.path,path);assert.equal(p.teaching_entry.sha256,teacherHashes[d.file]);
    assert.equal(p.teaching_entry.function,'accept_ask');
    for(const [file,hash]of Object.entries({...supportHashes,[path]:teacherHashes[d.file]}))
        assert.ok(p.qualification_evidence?.some(e=>e.path===file&&e.sha256===hash),'missing Jueqing source: '+file);
    assert.equal(p.action,`ask ${d.npc} about ${d.topic}`);assert.deepEqual(p.actor,cfg.actor);
    assert.deepEqual(p.monitored_grants,[keyFor(d)]);assert.deepEqual(p.teaching_expectations,cfg.steps);
    assert.equal(p.expected,cfg.expected);assert.equal(raw.outcome,cfg.expected);assert.equal(raw.teaching.length,cfg.steps.length);
    for(const [i,s]of raw.teaching.entries()) {
        assert.equal(s.student,raw.before[0].object);assert.equal(s.student,raw.after[0].object);
        if(i===0){assert.deepEqual(s.before.skills,cfg.actor.skills);assert.deepEqual(s.before.learned,{});}
        const skills={...s.before.skills},learned={...s.before.learned};
        if(i===0&&cfg.expected==='observed')for(const skill of [d.skill,...basicTypes[d.skill],'martial-cognize']) {
            const level=skills[skill]??0;assert.ok(level<=180&&Math.floor(150000000/(level+100))>(level+1)**2);
            skills[skill]=level+1;learned[skill]=0;
        }
        assert.deepEqual(s.after.skills,skills,'Jueqing complete reward levels differ');
        assert.deepEqual(s.after.learned,learned,'Jueqing reward proficiency differs');
        for(const key of ['neili','max_neili','mappings','max_jingli','potential','learned_points','family',
            'master_id','master_name','shen','str','int','con','dex','combat_exp'])assert.deepEqual(s.after[key],s.before[key]);
    }
}
