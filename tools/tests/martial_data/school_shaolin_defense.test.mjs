import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { shaolinDefenseProfiles, shaolinDefenseConditions, validateShaolinDefenseRecord,
    shaolinDefenseEffects } from './school_shaolin_defense_cases.mjs';

const catalog=collectCatalog(root,buildInventory(root)), cases=shaolinDefenseConditions(catalog);
const find=suffix=>{const c=cases.find(c=>c.id.endsWith(suffix));assert.ok(c,suffix);return c;};
test('少林防御767条件35638样本，旧8161条件完整指纹不变',()=>{
    const all=preOctober29SchoolConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)),old=all.filter(c=>!['shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length,8161);assert.equal(old.reduce((n,c)=>n+c.samples,0),192460);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        'e1d8c311bba1aed1b4af2a0866be2aefe113021296abd5915674c1a2f915bdf0');
    assert.equal(cases.length,767);assert.equal(cases.reduce((n,c)=>n+c.samples,0),35638);
    assert.equal(new Set(all.map(c=>c.id)).size,all.length);
    assert.deepEqual(all.filter(c=>c.parameters.collection_group==='shaolin-defense'),cases);
    assert.equal(shaolinDefenseConditions(catalog,{smoke:true}).reduce((n,c)=>n+c.samples,0),1534);
});
test('42门来源核对：41招架、2轻功，不伪造缺失钩子',()=>{
    assert.equal(shaolinDefenseProfiles.length,42);
    const noHooks=['query_effect_parry','query_effect_dodge','valid_damage','query_parry_msg'];
    for(const p of shaolinDefenseProfiles){
        const s=catalog.skills.find(s=>s.id===p.skill);assert.ok(s.entries.some(e=>e.function==='valid_enable'));
        assert.ok(!s.entries.some(e=>noHooks.includes(e.function)));
        assert.equal(s.entries.some(e=>e.function==='query_dodge_msg'),p.skill==='shaolin-shenfa');
    }
    assert.equal(new Set(cases.filter(c=>c.parameters.usage==='parry').map(c=>c.parameters.skill)).size,41);
    assert.equal(new Set(cases.filter(c=>c.parameters.usage==='dodge').map(c=>c.parameters.skill)).size,2);
});
test('只激发一项防御，不自动配内功、绝招或特殊进攻',()=>{
    for(const c of cases){
        const p=c.parameters;assert.deepEqual(p.actor.mappings,{});
        assert.ok(Object.keys(p.target.mappings).every(k=>k===p.usage));
        assert.equal(p.actor.properties.jiali,0);assert.equal(p.target.properties.jiali,0);
        assert.equal(p.observe_seconds,0);assert.equal(p.expected,'observed');
        if(['ordinary','direct','query_dodge_msg'].includes(p.ability))assert.equal(c.samples,100);
        else assert.equal(c.samples,2);
    }
});
// Minimal synthetic records exercise accounting and assertions, not game quality.
function row(c){
    const p=c.parameters;
    const before=[p.actor,p.target].map(config=>({ ...config.properties,
        skills:structuredClone(config.skills),mappings:structuredClone(config.mappings),
        weapon:config.equipment?.type??'none',weapon_details:config.equipment?{program:'/tests/'+config.equipment.type}:{},
        busy:config.busy??0,temp:{apply:{}},effective_skills:{force:300}}));
    before[1].effective_skills[p.usage]=p.level/2+(p.target.mappings[p.usage]?p.level:0);
    const raw={outcome:'observed',before,immediate:structuredClone(before),launches:[],interfaces:[],
        defense_messages:[],defenses:[],dodge_checks:[],attacks:[],metrics:[{},{}]};
    if(c.method==='ordinary'){
        raw.attacks=[{actor:0,target:1,type:0,result:-1}];
        raw.dodge_checks=['base','settled'].map(phase=>({actor:0,target:1,type:0,phase,
            ap:100,dp:p.target.busy&&phase==='settled'?100:300,skill:p.target.mappings.dodge??0}));
    }else{
        const i={...p.interface,implemented_by:0,result:null};
        if(p.ability==='valid_enable'){
            i.implemented_by=p.interface.object;
            i.result=Number((p.skill==='shaolin-shenfa'?['dodge','move']:p.skill==='shaolin-tantui'?['parry','dodge']:['parry']).includes(p.interface.usage));
        }else if(p.ability==='query_dodge_msg'&&p.skill==='shaolin-shenfa'){
            i.implemented_by=p.interface.object;i.result='$n原始闪避文字\n';
        }
        raw.interfaces=[i];
        if(p.ability==='valid_damage')raw.defenses=[{actor:0,target:1,skill:p.skill,result:null}];
    }
    return raw;
}
test('接口缺失、实现来源、有效级别、配置均须核对',()=>{
    for(const c of cases.filter(c=>c.parameters.ability!=='direct'))validateShaolinDefenseRecord(row(c),c);
    const c=find('damo-jian-parry-query_effect_parry-l400'),r=row(c);
    r.interfaces[0].implemented_by='/kungfu/skill/damo-jian';
    assert.throws(()=>validateShaolinDefenseRecord(r,c));
    delete r.interfaces[0].implemented_by;assert.throws(()=>validateShaolinDefenseRecord(r,c));
});
test('持器轻功apply与忙乱DP都保留，不能按未持器预期硬判',()=>{
    const c=find('shaolin-tantui-dodge-ordinary-l400-armed'),r=row(c);
    r.before[1].temp.apply.dodge=-1;r.before[1].effective_skills.dodge--;
    validateShaolinDefenseRecord(r,c);
    const b=find('shaolin-shenfa-dodge-ordinary-l400-busy'),s=row(b);
    validateShaolinDefenseRecord(s,b);s.dodge_checks[1].dp=300;
    assert.throws(()=>validateShaolinDefenseRecord(s,b));
});
test('招架条件概率排除先前闪避，错误记录不算观察成功',()=>{
    const c=find('damo-jian-parry-ordinary-l400');
    const rows=[-1,-1,-2,0].map(result=>{const raw=row(c);raw.attacks[0].result=result;return {outcome:'observed',raw};});
    rows.push({outcome:'error',raw:{}});
    const result=shaolinDefenseEffects(rows);
    assert.equal(result.samples,4);assert.equal(result.parry.rate,0.25);
    assert.equal(result.parry_given_not_dodged.rate,0.5);
    assert.equal(shaolinDefenseEffects([]).parry.rate,null);
});
test('缺失接口不塞进数字0均值，文字0异常须原样保留',()=>{
    const c=find('shaolin-tantui-dodge-query_dodge_msg-l400'),r=row(c);
    const result=shaolinDefenseEffects([{outcome:'observed',raw:r}]);
    assert.equal(result.missing_interfaces,1);assert.equal(result.interface_numbers.mean,null);
    const s=readFileSync(root+'/tools/tests/martial_data/runner.lpc','utf8');
    assert.match(s,/"defense_messages"\]\s*\+=/);
    assert.match(s,/"type": type, "text": text/);
});
test('直伤不冒充普通攻击，不把传入1000当最终实际掉血',()=>{
    const c=find('damo-jian-parry-direct-l400'),r=row(c);
    r.interfaces[0]={...c.parameters.interface,implemented_by:'/adm/daemons/combatd',result:91};
    r.defenses=[{actor:0,target:1,skill:'damo-jian',result:null}];
    r.metrics=[{direct:1},{qi_cost:91}];validateShaolinDefenseRecord(r,c);
    r.metrics[1].qi_cost=0;assert.throws(()=>validateShaolinDefenseRecord(r,c));
});
