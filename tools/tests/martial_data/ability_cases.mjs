// Mechanism checks, deliberately separate from same-level weapon comparisons.
import { weaponConditions } from './weapon_cases.mjs';
import assert from 'node:assert/strict';
import { learningConditions, validateLearningRecord } from './learning_cases.mjs';
import { skillMusicLearnConditions, skillMusicConditions, validateSkillMusicRecord } from './skill_music_cases.mjs';
import { skillInheritedConditions, validateSkillInheritedRecord } from './skill_inherited_cases.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';

export function abilityConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [], weapons = weaponConditions(catalog, { smoke: true });
    const fresh = () => structuredClone(weapons.find(c => c.id.startsWith('sword-perform')).parameters);
    const add = (id, skill, method, parameters) => {
        const source = catalog.skills.find(s => s.id === skill);
        const fn = method === 'interface' ? parameters.interface.function : method;
        result.push({ id, stage: 'skill', entry_id: source.entries.find(e => e.function === fn).id,
            method, samples: smoke || method === 'interface' ? 2 : samples,
            parameters: { ...parameters, qualification_sources: [source.path], expected: parameters.expected ?? 'observed' } });
    };
    const force = (level = 200) => {
        const p = fresh();
        p.actor = { skills: { force: level, 'jiuyin-shengong': level }, mappings: { force: 'jiuyin-shengong' }, properties: {} };
        p.fighting = false; delete p.profile;
        return p;
    };
    let p = force();
    p.actor.properties.qi = 8000; p.action = 'exert recover';
    add('ability-recover', 'force/recover', 'exert', p);
    p = force(); p.action = 'exert shield';
    add('ability-shield', 'jiuyin-shengong/exert/shield', 'exert', p);
    p = force(20); p.action = 'exert powerup'; p.observe_seconds = 17;
    p.note = '低级实验角色，仅核验 exert 原接口及 15 秒解除；不证明学习资格或代表战斗强度。';
    add('ability-powerup-expiry', 'jiuyin-shengong/exert/powerup', 'exert', p);
    p = structuredClone(weapons.find(c => c.id.startsWith('dagger-perform')).parameters);
    p.target.skills.dodge = 1;
    add('ability-busy', 'jingyue-bifa/ci', 'perform', p);
    p = structuredClone(weapons.find(c => c.id.startsWith('throwing-perform')).parameters);
    p.target.skills.dodge = 1; p.observe_seconds = 8;
    p.note = '弱闪避目标核验弹药/致盲及 6 秒回调；不与中性目标成功率混算。';
    add('ability-ammunition-expiry', 'jinshe-zhui/tuwu', 'perform', p);
    p = fresh();
    p.actor = { skills: { force: 1000, finger: 200, 'liumai-shenjian': 200 },
        mappings: { finger: 'liumai-shenjian' }, preparations: { finger: 'liumai-shenjian' },
        properties: { 'can_perform/liumai-shenjian/qi': 1 } };
    p.target.skills.force = 1; p.action = 'perform finger.qi'; delete p.profile;
    add('ability-disarm', 'liumai-shenjian/qi', 'perform', p);
    for (const allowed of [true, false]) {
        p = fresh(); p.fighting = false; p.action = 'test_interface';
        p.actor.properties.max_neili = allowed ? 6000 : 0;
        p.interface = { object: '/kungfu/skill/huashan-jian', function: 'valid_learn' };
        p.expected = allowed ? 'observed' : 'refused';
        add('ability-learning-' + (allowed ? 'allowed' : 'refused'), 'huashan-jian', 'interface', p);
    }
    for (const missing of ['dodge', 'force']) {
        p = fresh(); p.fighting = false; p.action = 'test_interface';
        p.actor = { skills: { 'jiuyin-shengong': 200, 'martial-cognize': 260, unarmed: 200,
            dodge: 200, force: 200, [missing]: 199 }, mappings: {},
            properties: { str: 38, con: 34, character: '光明磊落' } };
        p.interface = { object: '/kungfu/skill/jiuyin-shengong', function: 'valid_learn' };
        p.expected = 'refused'; p.known_issue = 'MA-002';
        p.note = '复现错误提示，不证明错误提示符合设计；只记录、后续修复。';
        add('ability-ma002-' + missing, 'jiuyin-shengong', 'interface', p);
    }
    for (const level of [0, 400]) {
        p = structuredClone(weapons.find(c => c.id.startsWith('xsword-perform')).parameters);
        if (level) p.actor.skills['chuixiao-jifa'] = level;
        p.known_issue = 'MA-001';
        p.note = '只改变真实吹箫技法等级；不创建错误 ID，不修改原公式。核验当前确定失败分支，不推算修复后的随机成功率。';
        add('ability-ma001-flute-' + level, 'yuxiao-jian/qing', 'perform', p);
        result.at(-1).parameters.qualification_sources.push('kungfu/skill/chuixiao-jifa.c');
    }
    const readSource = path => readFileSync(join(root, path));
    return [...result, ...learningConditions(catalog),
        ...skillMusicLearnConditions(catalog, readSource),
        ...skillMusicConditions(catalog, readSource, { smoke, samples }),
        ...skillInheritedConditions(catalog, readSource, { smoke })];
}

// Fixture acceptance, not a balance target. Values follow these explicit cases.
export function validateAbilityRecord(raw, condition) {
    if (raw.condition_id.startsWith('learning-')) return validateLearningRecord(raw, condition);
    if (raw.condition_id.startsWith('skill-music-')) return validateSkillMusicRecord(raw, condition);
    if (raw.condition_id.startsWith('skill-inherited-')) return validateSkillInheritedRecord(raw, condition);
    const actor = raw.immediate[0], target = raw.immediate[1], final = raw.after;
    switch (raw.condition_id) {
        case 'ability-recover':
            assert.equal(raw.metrics[0].qi_recovery, 2000);
            assert.equal(raw.metrics[0].neili_cost, 666);
            break;
        case 'ability-shield':
            assert.equal(actor.temp.shield, 1);
            assert.equal(actor.temp.apply.armor - raw.before[0].temp.apply.armor, 150);
            break;
        case 'ability-powerup-expiry':
            assert.equal(actor.temp.powerup, 1);
            assert.equal(actor.temp.apply.attack, 10);
            assert.equal(actor.temp.apply.dodge, 7);
            assert.equal(actor.temp.apply.parry, 7);
            assert.ok(!final[0].temp.powerup);
            assert.equal(final[0].temp.apply.attack, 0);
            assert.equal(final[0].temp.apply.dodge, 0);
            assert.equal(final[0].temp.apply.parry, 0);
            assert.ok(raw.elapsed >= 17);
            assert.deepEqual(raw.callbacks.map(c => [c.side, c.phase]), [[0, 'before'], [0, 'after']]);
            assert.ok(raw.callbacks[0].elapsed >= 15 && raw.callbacks[1].elapsed <= raw.elapsed);
            assert.equal(raw.callbacks[0].state.temp.powerup, 1);
            assert.ok(!raw.callbacks[1].state.temp.powerup);
            break;
        case 'ability-busy':
            assert.ok(target.busy >= 2 && target.busy <= 9);
            assert.equal(raw.metrics[0].neili_cost, 80);
            assert.equal(raw.metrics[1].qi_cost ?? 0, 0);
            break;
        case 'ability-ammunition-expiry':
            assert.equal(actor.ammunition, 9);
            assert.equal(raw.before[0].ammunition, 10);
            assert.equal(target.temp.block_msg.all, 1);
            assert.equal(actor.temp.jinshe.tuwu, 1);
            assert.ok(!final[0].temp.jinshe.tuwu && !final[1].temp.block_msg.all);
            assert.equal(raw.metrics[0].neili_cost, 200);
            assert.equal(raw.metrics[1].qi_cost, 66);
            assert.equal(raw.metrics[1].eff_qi_cost, 66);
            assert.ok(raw.elapsed >= 8);
            for (const side of [0, 1]) {
                const callbacks = raw.callbacks.filter(c => c.side === side);
                assert.deepEqual(callbacks.map(c => c.phase), ['before', 'after']);
                assert.ok(callbacks[0].elapsed >= 6 && callbacks[1].elapsed <= raw.elapsed);
            }
            break;
        case 'ability-disarm':
            assert.equal(raw.before[1].weapon, 'sword');
            assert.equal(target.weapon, 'none');
            assert.equal(raw.dropped.length, 1);
            assert.equal(raw.dropped[0].type, 'sword');
            assert.ok(raw.dropped[0].no_wield);
            assert.equal(raw.metrics[0].neili_cost, 400);
            break;
        case 'ability-learning-allowed':
        case 'ability-learning-refused':
            assert.equal(raw.interfaces.length, 1);
            assert.equal(raw.interfaces[0].function, 'valid_learn');
            assert.equal(raw.interfaces[0].result, raw.condition_id.endsWith('-allowed') ? 1 : 0);
            assert.deepEqual(raw.metrics, [{}, {}]);
            if (raw.condition_id.endsWith('-refused')) assert.match(raw.reason, /内力不够/);
            break;
        case 'ability-ma002-dodge':
        case 'ability-ma002-force':
            assert.equal(raw.interfaces[0].result, 0);
            assert.equal(raw.outcome, 'refused');
            assert.match(raw.reason, raw.condition_id.endsWith('-dodge') ? /掌法/ : /爪法/);
            break;
        case 'ability-ma001-flute-0':
        case 'ability-ma001-flute-400':
            assert.equal(raw.before[0].skills['chuixiao-jifa'] ?? 0,
                raw.condition_id.endsWith('-400') ? 400 : 0);
            assert.equal(raw.before[0].skills['chuixiao-jiafa'] ?? 0, 0);
            assert.equal(raw.before[0].effective_skills.sword, 300);
            assert.equal(raw.before[0].effective_skills.force, 300);
            assert.equal(raw.before[1].effective_skills.force, 300);
            assert.equal(raw.metrics[0].neili_cost, 120);
            assert.equal(raw.metrics[1].neili_cost ?? 0, 0);
            assert.equal(actor.busy, 2);
            break;
        default: assert.fail('未定义的机制观察：' + raw.condition_id);
    }
}
