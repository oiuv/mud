import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { wudangCombinationConditions, validateWudangCombinationRecord } from './school_wudang_combination_cases.mjs';
import { wudangCombinationEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-combination');
const find = (id, level = 200) => { const c = cases.find(c => c.id === `school-wudang-combination-${id}-l${level}`); assert.ok(c, id); return c; };

test('互备127条件4762样本，旧3329条件88604样本保持独立', () => {
    assert.equal(cases.length, 127); assert.equal(cases.reduce((n,c) => n + c.samples, 0), 4762);
    const old = all.filter(c => !['wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 3329); assert.equal(old.reduce((n,c) => n + c.samples, 0), 88604);
    assert.equal(cases.filter(c => c.method === 'round').length, 46);
    assert.equal(cases.filter(c => c.method === 'interface').length, 15);
    assert.equal(wudangCombinationConditions(catalog, { smoke: true }).reduce((n,c) => n + c.samples, 0), 254);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
});

test('三种命令路径、两种顺序和三档等级都走原prepare，不预写准备', () => {
    for (const c of cases) {
        assert.deepEqual(c.parameters.actor.preparations, {});
        assert.equal(c.parameters.actor.temp, undefined);
        assert.ok(c.parameters.qualification_sources.includes('cmds/skill/prepare.c'));
        for (const step of c.parameters.prepare_commands ?? []) assert.match(step.action, /^prepare /);
    }
    assert.equal(cases.filter(c => /-(names|basics|sequential)-l/.test(c.id)).length, 54);
    assert.equal(find('dex8-round',400).parameters.actor.properties.dex, 8);
    assert.equal(find('dex8-round',400).parameters.actor.skills.dodge, 0);
    assert.equal(find('taiji-quan-allows-taiji-quan').parameters.combine_result, 0);
    assert.equal(find('taiji-quan-allows-paiyun-shou').parameters.combine_result, 1);
    assert.match(readFileSync(join(root, 'include/combat.h'), 'utf8'), /#define\s+TYPE_QUICK\s+2\b/);
});

// Minimal artificial records test the reader, never the game's outcomes.
function row(c, double = false) {
    const p = c.parameters;
    const state = { preparations: {}, preparation_order: [], temp: {}, neili: 6000,
        skills: structuredClone(p.actor.skills), mappings: structuredClone(p.actor.mappings) };
    const raw = { method: c.method, before: [structuredClone(state), {}], outcome: p.expected,
        interfaces: [], launches: [], attacks: [], prepare_steps: [], metrics: [{}, {}] };
    let previous = state;
    for (const e of p.prepare_commands ?? []) {
        const after = structuredClone(previous); after.preparations = structuredClone(e.preparations);
        after.preparation_order = Object.keys(after.preparations);
        raw.prepare_steps.push({ action: e.action, accepted: e.accepted, before: previous, after, reason: e.accepted ? '' : '原拒绝' });
        previous = after;
    }
    raw.immediate = [structuredClone(previous), {}];
    if (c.method === 'interface') raw.interfaces = [{ ...p.interface, result: p.combine_result }];
    if (c.method === 'round') {
        raw.immediate[0].temp.guarding=0;
        for(let index=0; index<(double?2:1); index++) {
            const usage=p.actor.equipment?'sword':previous.preparation_order[index]??'unarmed';
            raw.attacks.push({actor:0,target:1,type:p.target.busy?2:0,result:0,
                action_flag:index,attack_usage:usage,attack_skill:p.actor.mappings[usage]});
        }
        raw.metrics[0].neili_cost=0;
        raw.immediate[0].neili-=raw.metrics[0].neili_cost;
    }
    return raw;
}

test('逐命令状态和拒绝独立核对，部分成功不是所有命令成功', () => {
    for(const c of cases) validateWudangCombinationRecord(row(c),c);
    const c=find('third-refused'), r=row(c);
    const summary=wudangCombinationEffects([{raw:r}]);
    assert.equal(summary.commands,2);assert.equal(summary.accepted,1);assert.equal(summary.rejected,1);
    assert.equal(summary.rounds,0);assert.equal(summary.double_rounds.rate,null);
    r.prepare_steps[1].before=structuredClone(r.prepare_steps[1].before);
    r.prepare_steps[1].before.neili--;assert.throws(()=>validateWudangCombinationRecord(r,c),/重置/);
});

test('真实选招标志、两次攻击和归还检查不以总伤害替代', () => {
    const c=find('taiji-quan-wudang-zhang-jiali50',400), r=row(c,true);
    validateWudangCombinationRecord(r,c);
    const summary=wudangCombinationEffects([{raw:r}]);
    assert.equal(summary.primary_attacks,2);assert.equal(summary.double_rounds.successes,1);
    const wrong=structuredClone(r);wrong.attacks[1].attack_usage='unarmed';
    assert.throws(()=>validateWudangCombinationRecord(wrong,c));
    const flag=structuredClone(r);flag.immediate[0].temp.action_flag=1;
    assert.throws(()=>validateWudangCombinationRecord(flag,c),/归还/);
    const cost=structuredClone(r);cost.metrics[0].neili_cost=50;
    assert.throws(()=>validateWudangCombinationRecord(cost,c),/加力/);
});

test('取消、持器及身法8对照不能伪报互备双击，未知命中标记拒绝', () => {
    for (const id of ['cancel-round','armed-round','dex8-round']) {
        const c=find(id,400);assert.throws(()=>validateWudangCombinationRecord(row(c,true),c));
    }
    const c=find('taiji-quan-wudang-zhang-jiali0',400), r=row(c);
    r.attacks[0].result=123;assert.throws(()=>validateWudangCombinationRecord(r,c));
});

test('准备命令不得注入技能或资源，配对接口实参不得改写', () => {
    const c=find('cancel-and-replace'),r=row(c);r.prepare_steps[0].after.skills['taiji-quan']++;
    assert.throws(()=>validateWudangCombinationRecord(r,c),/准备不得/);
    const q=find('taiji-quan-allows-paiyun-shou'),v=row(q);v.interfaces[0].combo='wudang-zhang';
    assert.throws(()=>validateWudangCombinationRecord(v,q));
});

test('守势零出招单列，未设置的首击标志保留null，不伪造命中或额外攻击', () => {
    const c=find('taiji-quan-wudang-zhang-jiali50'),r=row(c);
    r.attacks=[];r.metrics[0]={};r.immediate[0].neili=6000;r.immediate[0].temp.guarding=1;
    validateWudangCombinationRecord(r,c);
    const s=wudangCombinationEffects([{raw:r}]);
    assert.equal(s.guarding_rounds,1);assert.equal(s.attacking_rounds,0);
    assert.equal(s.double_given_attack.rate,null);
    r.immediate[0].temp.guarding=0;
    assert.throws(()=>validateWudangCombinationRecord(r,c),/守势/);
    const attack=row(c);attack.attacks[0].action_flag=null;
    validateWudangCombinationRecord(attack,c);
});
