import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { shaolinPairs, shaolinCombinationConditions, validateShaolinCombinationRecord } from './school_shaolin_combination_cases.mjs';
import { wudangCombinationEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = shaolinCombinationConditions(catalog);
const find = suffix => { const c=cases.find(c=>c.id.endsWith(suffix)); assert.ok(c,suffix); return c; };

test('少林互备358条件14044样本，旧7803条件完整指纹不变', () => {
    const all=schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old=all.filter(c=>!['shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length,7803);assert.equal(old.reduce((n,c)=>n+c.samples,0),178416);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '3651f13b699db9196f845be9b72610c1b4f7308d277e63423ce879aca7eea380');
    assert.deepEqual(all.filter(c=>c.parameters.collection_group==='shaolin-combination'),cases);
    assert.equal(cases.length,358);assert.equal(cases.reduce((n,c)=>n+c.samples,0),14044);
    assert.equal(new Set(all.map(c=>c.id)).size,all.length);
    assert.equal(shaolinCombinationConditions(catalog,{smoke:true}).reduce((n,c)=>n+c.samples,0),716);
});

test('七组双向与一组单向分开，命令形式改变被询问的技能', () => {
    assert.equal(shaolinPairs.length,7);
    for(const [a,,b] of shaolinPairs)for(const first of [a,b])for(const level of [200,400,800])
        for(const route of ['names','basics','sequential']) {
            const c=find(`${a}-${b}-${first}-${route}-l${level}`);
            assert.ok(c.parameters.prepare_commands.every(s=>s.accepted===1));
        }
    assert.equal(find('pona-gong-hunyuan-zhang-hunyuan-zhang-names-l200').parameters.expected,'refused');
    assert.deepEqual(find('pona-gong-hunyuan-zhang-hunyuan-zhang-sequential-l200').parameters.prepare_commands.map(s=>s.accepted),[1,1]);
    assert.deepEqual(find('pona-gong-hunyuan-zhang-pona-gong-sequential-l200').parameters.prepare_commands.map(s=>s.accepted),[1,0]);
});

// Artificial minimal records only test validator behavior, not game effects.
function row(c,double=false) {
    const p=c.parameters,state={preparations:{},preparation_order:[],temp:{},neili:6000,
        skills:structuredClone(p.actor.skills),mappings:structuredClone(p.actor.mappings),
        effective_str:p.actor.properties.str};
    const raw={method:c.method,before:[structuredClone(state),{}],outcome:p.expected,
        interfaces:[],launches:[],attacks:[],prepare_steps:[],metrics:[{},{}]};let previous=state;
    for(const e of p.prepare_commands??[]) {
        const after=structuredClone(previous);after.preparations=structuredClone(e.preparations);
        after.preparation_order=Object.keys(after.preparations);
        raw.prepare_steps.push({...e,before:previous,after,reason:e.accepted?'':'原拒绝'});previous=after;
    }
    raw.immediate=[structuredClone(previous),{}];
    if(c.method==='interface')raw.interfaces=[{...p.interface,result:p.combine_result}];
    if(c.method==='round') {
        raw.immediate[0].temp.guarding=0;
        for(let i=0;i<(double?2:1);i++) {
            const usage=p.actor.equipment?'sword':previous.preparation_order[i]??'unarmed';
            raw.attacks.push({actor:0,target:1,type:p.target.busy?2:0,result:0,action_flag:i,
                attack_usage:usage,attack_skill:p.actor.mappings[usage]??null});
        }
    }
    return raw;
}

test('状态连续、原准备结果与零未映射加力费逐项校验', () => {
    for(const c of cases)validateShaolinCombinationRecord(row(c),c);
    const c=find('luohan-quan-qinna-shibada-luohan-quan-sequential-l400'),r=row(c);
    r.prepare_steps[1].before=structuredClone(r.prepare_steps[1].before);r.prepare_steps[1].before.neili--;
    assert.throws(()=>validateShaolinCombinationRecord(r,c),/重置/);
    const s=find('luohan-quan-qinna-shibada-pair-jiali50-l400'),t=row(s,true);t.metrics[0].neili_cost=50;
    assert.throws(()=>validateShaolinCombinationRecord(t,s),/加力/);
});

test('伏虎历史互备在注释中，不能伪造当前入口、技能文件或映射', () => {
    for(const c of cases.filter(c=>c.parameters.skill==='fuhu-quan')) {
        assert.equal(c.parameters.actor.skills['qinlong-shou'],undefined);
        assert.equal(c.parameters.actor.mappings.hand,undefined);
        assert.ok(!c.parameters.qualification_sources.includes('kungfu/skill/qinlong-shou.c'));
        if(c.method==='prepare')assert.equal(c.parameters.expected,'refused');
    }
    assert.equal(find('str32-qinlong-shou-l200').parameters.combine_result,null);
    assert.equal(find('str33-qinlong-shou-l200').parameters.combine_result,null);
    assert.ok(!catalog.skills.find(s=>s.id==='fuhu-quan').entries.some(e=>e.function==='valid_combine'));
    const c=find('str33-qinlong-shou-l200'),r=row(c);r.before[0].effective_str=53;
    assert.throws(()=>validateShaolinCombinationRecord(r,c));
});

test('所有实际互备声明均来自tokenizer确认的函数，不匹配注释', () => {
    for(const [a,,b] of shaolinPairs) for(const [skill,combo] of [[a,b],[b,a]]) {
        const entry=catalog.skills.find(s=>s.id===skill).entries.find(e=>e.function==='valid_combine');
        assert.ok(entry);assert.ok(entry.evidence.text.includes('"'+combo+'"'));
    }
});

test('互备不保证每轮双击，持器、取消、低身法与守势分开', () => {
    for(const suffix of ['armed-round-l400','cancel-round-l400','dex8-round-l400']) {
        const c=find(suffix);assert.throws(()=>validateShaolinCombinationRecord(row(c,true),c));
    }
    const c=find('luohan-quan-qinna-shibada-luohan-quan-pair-l400'),r=row(c);
    r.attacks=[];r.immediate[0].temp.guarding=1;validateShaolinCombinationRecord(r,c);
    const summary=wudangCombinationEffects([{raw:r}]);assert.equal(summary.guarding_rounds,1);
    assert.equal(summary.double_given_attack.rate,null);
});

test('单向声明造成部分命令拒绝，不能按最终有准备就记全部成功', () => {
    const c=find('pona-gong-hunyuan-zhang-pona-gong-sequential-l200'),r=row(c);
    const s=wudangCombinationEffects([{raw:r}]);assert.equal(s.accepted,1);assert.equal(s.rejected,1);
    r.prepare_steps[1].accepted=1;assert.throws(()=>validateShaolinCombinationRecord(r,c));
});

test('攻击轮必须使用原准备顺序，不能用相同总伤害掩盖错配', () => {
    const c=find('banruo-zhang-yizhi-chan-banruo-zhang-pair-l400'),r=row(c,true);
    validateShaolinCombinationRecord(r,c);r.attacks[1].attack_skill='banruo-zhang';
    assert.throws(()=>validateShaolinCombinationRecord(r,c));
});

test('未激发基本拳脚的原LPC零值正常保留，不伪造特殊武学', () => {
    const c=find('banruo-zhang-yizhi-chan-cancel-round-l400'),r=row(c);
    r.attacks[0].attack_skill=0;validateShaolinCombinationRecord(r,c);
    r.attacks[0].attack_skill='banruo-zhang';assert.throws(()=>validateShaolinCombinationRecord(r,c));
});

test('新分组必须记录准备顺序和出招明细，不以字段缺失绕过核查', () => {
    const source=readFileSync(root+'/tools/tests/martial_data/runner.lpc','utf8');
    const snapshot=source.slice(source.indexOf('mapping snapshot(object ob) {')).split('\n}\n')[0];
    const attackObserver=source.slice(source.indexOf('void observe_attack(')).split('\n}\n')[0];
    for(const section of [snapshot,attackObserver]) {
        // Snapshot may have earlier group-specific fields unrelated to combat order.
        const groups=[...section.matchAll(/member_array\(\s*current\["parameters"\]\["collection_group"\],\s*\(\{([^}]*)\}\)/g)]
            .map(match=>match[1]).find(names=>names.includes('"wudang-combination"'));
        assert.ok(groups,'选招观察必须有分组条件');
        for(const group of ['wudang-combination','shaolin-combination','wudang-bout','shaolin-bout'])
            assert.ok(groups.includes('"'+group+'"'),group);
    }
    assert.match(snapshot,/result\["preparation_order"\] = keys\(ob->query_skill_prepare\(\) \|\| \(\[\]\)\)/);
    assert.match(attackObserver,/value\["attack_skill"\] = me->query_skill_mapped\(usage\)/);
    const c=find('banruo-zhang-yizhi-chan-banruo-zhang-pair-l400'),r=row(c);
    delete r.prepare_steps[0].after.preparation_order;
    assert.throws(()=>validateShaolinCombinationRecord(r,c));
});
