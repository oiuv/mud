// Source-derived expectations only; all observations execute original LPC.
import assert from 'node:assert/strict';
import { shaolinForces } from './school_shaolin_cultivation_cases.mjs';
import { validateShaolinRecoveryRecord } from './school_shaolin_recovery_cases.mjs';
import { distribution } from './statistics.mjs';

const marked = ['luohan-quan', 'fuhu-quan'];
export const backlashMessages = {
    severe: '心中一阵绞痛', mild: '内息一阵紊乱，四肢百骸', hot: '心烦意乱', uneasy: '异样的感觉',
};

export function shaolinBacklashExpected(actor) {
    const s = actor.skills, p = actor.properties;
    const burden = marked.reduce((n, k) => n + Math.trunc((s[k] ?? 0) ** 2 / 100) * (s[k] ?? 0), 0);
    const buddhism = s.buddhism ?? 0;
    let capacity = buddhism * Math.trunc(buddhism * buddhism / 25);
    const exempt = Boolean(p.reborn && (buddhism > 299 || (p['family/family_name'] === '少林派' && buddhism > 199))
        || p['family/family_name'] === '少林派' && buddhism > 399 || buddhism > 499);
    const threshold = exempt ? 1 : burden;
    if (!exempt) capacity += Math.trunc(capacity / 2);
    const branch = burden < 10000 ? 'below-threshold' : capacity < Math.trunc(threshold * 9 / 10) ? 'severe'
        : capacity < threshold ? 'mild' : capacity < Math.trunc(threshold * 11 / 10) ? 'hot'
            : capacity < Math.trunc(threshold * 13 / 10) ? 'uneasy' : 'clear';
    return { burden, capacity, exempt, branch, blocks: ['severe', 'mild'].includes(branch) };
}

export function shaolinBacklashConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(force, method, tag, { level = 200, martial = 200, buddhism = 0, ...extra } = {}) {
        const actor = { skills: { force: level, [force]: level,
            ...(martial ? { 'luohan-quan': martial } : {}), ...(buddhism ? { buddhism } : {}), ...extra.skills },
            mappings: extra.unmapped ? {} : { force, ...extra.mappings },
            properties: { qi: method === 'exercise' ? 10000 : 5000, eff_qi: 10000, max_qi: 10000,
                jing: method === 'regenerate' ? 5000 : 10000, eff_jing: 10000, max_jing: 10000,
                neili: 6000, max_neili: 6000, int: 36, con: 36, jiali: 0, combat_exp: 100000000,
                'family/family_name': '少林派', gender: '男性', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}) };
        if (extra.empty) { actor.skills = {}; actor.mappings = {}; }
        const e = shaolinBacklashExpected(actor), precheck = Boolean(extra.precheck);
        const refused = method !== 'interface' && (precheck || e.blocks);
        const random = !precheck && e.blocks;
        const source = catalog.skills.find(s => s.id === force); assert.ok(source);
        result.push({ id: `school-shaolin-backlash-${force}-${method}-${tag}`, stage: 'school',
            entry_id: source.path, method: ['recover', 'regenerate'].includes(method) ? 'exert' : method,
            samples: smoke ? 1 : random ? samples : 2,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-backlash',
                skill: force, usage: 'force', ability: method, level, combination: tag, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: method === 'interface' ? 'test_interface' : method === 'exercise' ? 'exercise 10' : `exert ${method}`,
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + force, function: 'do_effect' } } : {}),
                expected: refused ? 'refused' : 'observed', backlash: e, precheck,
                room: extra.room ?? {}, exercise_cost: 10, halt_after: 0,
                observation: method === 'exercise' ? 'timed_effect' : 'single_action_immediate',
                fighting: extra.fighting ?? false, observe_seconds: method === 'exercise' ? 30 : 0,
                not_applicable: '',
                qualification_sources: [source.path, 'inherit/skill/force.c', 'inherit/skill/shaolin.c',
                    'kungfu/skill/luohan-quan.c', 'kungfu/skill/fuhu-quan.c', 'kungfu/skill/huashan-jian.c', 'kungfu/skill/force.c',
                    'cmds/skill/exert.c', 'cmds/skill/exercise.c', 'inherit/skill/skill.c',
                    'kungfu/skill/force/recover.c', 'kungfu/skill/force/regenerate.c',
                    'feature/damage.c', 'feature/skill.c', 'clone/user/user.c', 'kungfu/class/shaolin/cheng-yi.c'],
                qualification_note: '真实非巫师USER；直接调用原do_effect另与exert和原心跳exercise对照。少林武学负担来自已掌握原始等级，不伪造标记、不强制随机。接口返回1表示阻止运功，不是成功恢复；命令拒绝仍可能自损。1000级罗汉拳仅隔离豁免阈值，不证明教师可授或正常养成。转世重生reborn与打通任督二脉breakup分别观察；无死亡/昏迷样本，不代表其生命周期。',
            } });
    }
    for (const force of shaolinForces) {
        add(force, 'interface', 'empty', { empty: true });
        add(force, 'interface', 'no-marked', { martial: 0 });
        add(force, 'interface', 'martial99', { martial: 99 });
        add(force, 'interface', 'martial100', { martial: 100 });
        for (const [martial, thresholds] of [[200, [106, 107, 110, 111, 113, 114, 120, 121]],
            [400, [212, 213, 220, 221, 227, 228, 240, 241]], [800, [425, 426, 440, 441, 454, 455, 480, 481]]])
            for (const buddhism of thresholds) add(force, 'interface', `m${martial}-b${buddhism}`, {
                martial, buddhism, properties: martial === 800 ? { 'family/family_name': '武当派' } : {},
            });
        add(force, 'interface', 'two99', { martial: 99, skills: { 'fuhu-quan': 99 } });
        add(force, 'interface', 'two99-b60', { martial: 99, buddhism: 60, skills: { 'fuhu-quan': 99 } });
        add(force, 'interface', 'mapped', { buddhism: 106, skills: { cuff: 200 }, mappings: { cuff: 'luohan-quan' } });
        add(force, 'interface', 'unrelated-high', { buddhism: 121, skills: { sword: 1000, 'huashan-jian': 1000 } });
        for (const [tag, buddhism, family, reborn] of [
            ['reborn-shaolin199', 199, '少林派', 1], ['reborn-shaolin200', 200, '少林派', 1],
            ['reborn-other299', 299, '武当派', 1], ['reborn-other300', 300, '武当派', 1],
            ['shaolin399', 399, '少林派', 0], ['shaolin400', 400, '少林派', 0],
            ['other499', 499, '武当派', 0], ['other500', 500, '武当派', 0],
        ]) add(force, 'interface', tag, { martial: 1000, buddhism, properties: { 'family/family_name': family, reborn } });
        add(force, 'interface', 'breakup-not-reborn', { martial: 1000, buddhism: 200, properties: { breakup: 1 } });
        for (const method of ['recover', 'regenerate', 'exercise']) {
            for (const buddhism of [106, 107, 111, 114, 121]) add(force, method, 'b' + buddhism, { buddhism });
            add(force, method, 'busy', { busy: true, precheck: true });
            add(force, method, 'unmapped', { unmapped: true, precheck: true });
        }
        add(force, 'recover', 'no-exert', { temp: { no_exert: 1 }, precheck: true });
        add(force, 'recover', 'neili0-before-backlash', { properties: { neili: 0 } });
        add(force, 'exercise', 'qi9-before-backlash', { properties: { qi: 9 }, precheck: true });
        add(force, 'exercise', 'jing69-before-backlash', { properties: { jing: 6999 }, precheck: true });
        add(force, 'exercise', 'fighting-before-backlash', { fighting: true, precheck: true });
        add(force, 'exercise', 'room-before-backlash', { room: { no_fight: 1 }, precheck: true });
    }
    return result;
}

export function validateShaolinBacklashRecord(raw, condition) {
    const p = condition.parameters, b = raw.before[0], a = raw.immediate[0], e = shaolinBacklashExpected(p.actor);
    assert.deepEqual(e, p.backlash); assert.equal(raw.outcome, p.expected);
    assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    assert.equal(raw.attacks.length, 0); assert.deepEqual(raw.after[1], raw.before[1]);
    assert.deepEqual(b.skills, p.actor.skills); assert.deepEqual(b.mappings, p.actor.mappings);
    assert.deepEqual(raw.after[0].skills, b.skills); assert.deepEqual(raw.after[0].mappings, b.mappings);
    assert.equal(b.userp, 1); assert.equal(b.wizardp, 0);
    assert.equal(b.cultivation.reborn ?? 0, p.actor.properties.reborn ?? 0);
    assert.equal(b.cultivation['family/family_name'], p.actor.properties['family/family_name']);
    for (const k of ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'])
        assert.equal(b[k], p.actor.properties[k], k);
    const messages = raw.backlash_messages.join('');
    for (const [branch, text] of Object.entries(backlashMessages))
        assert.equal(messages.includes(text), !p.precheck && e.branch === branch, '原分支提示：' + branch);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1); const call = raw.interfaces[0];
        assert.equal(call.function, 'do_effect'); assert.equal(call.object, p.interface.object);
        assert.equal(call.implemented_by, '/inherit/skill/force'); assert.equal(call.result, Number(e.blocks));
    } else assert.equal(raw.interfaces.length, 0);
    if (condition.method !== 'interface' && !e.blocks && !p.precheck) {
        validateShaolinRecoveryRecord(raw, condition); return;
    }
    assert.equal(raw.launches.length, 0); assert.deepEqual(raw.after[0], a);
    assert.equal((raw.exercise_steps ?? []).length, 0);
    const severity = p.precheck ? '' : e.branch;
    const ranges = severity === 'severe' ? { qi: [400, 799], jing: [200, 399] }
        : severity === 'mild' ? { qi: [200, 399], jing: [100, 199] } : { qi: [0, 0], jing: [0, 0] };
    for (const k of ['qi', 'jing']) {
        const delta = b[k] - a[k], [lo, hi] = ranges[k];
        assert.ok(delta >= lo && delta <= hi, `${severity} ${k}: ${delta}`);
        assert.equal(raw.metrics[0][k + '_cost'] ?? 0, delta);
        assert.equal(raw.metrics[0][k + '_recovery'] ?? 0, 0);
    }
    for (const k of ['eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'neili', 'max_neili']) assert.equal(a[k], b[k], k);
    assert.equal(a.busy ?? 0, b.busy ?? 0);
    const temp = structuredClone(a.temp);
    if (p.expected === 'refused' && Object.hasOwn(temp, 'notify_fail')) {
        assert.equal(typeof temp.notify_fail, 'string'); assert.ok(temp.notify_fail.length);
        delete temp.notify_fail;
    }
    assert.deepEqual(temp, b.temp);
}

export function shaolinBacklashEffects(rows) {
    // Refused commands can have self-damage; do not discard them as no-effect.
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    const damaged = raw.filter(r => ['severe', 'mild'].some(k => r.backlash_messages.join('').includes(backlashMessages[k])));
    return { attempts: raw.length, damaged: damaged.length,
        interface_blocks: raw.filter(r => r.interfaces.some(c => c.function === 'do_effect' && c.result === 1)).length,
        // Only actual backlash damage; exercise conversion is not an injury.
        damage: Object.fromEntries(['qi', 'jing'].map(k => [k, distribution(damaged.map(r => r.metrics[0][k + '_cost'] ?? 0))])),
        neili_cost: distribution(raw.map(r => r.metrics[0].neili_cost ?? 0)),
        messages: Object.fromEntries(Object.entries(backlashMessages).map(([k, text]) =>
            [k, raw.filter(r => r.backlash_messages.join('').includes(text)).length])) };
}
