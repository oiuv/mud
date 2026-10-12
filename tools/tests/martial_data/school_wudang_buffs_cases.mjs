// Explicit sequences through original exert. Refills are recorded experiment inputs,
// not natural regeneration; persistence probes are not full login/death simulations.
import assert from 'node:assert/strict';
import { publicForceConditions } from './school_wudang_public_force_cases.mjs';

export function wudangBuffConditions(catalog, options) {
    return buffConditions(catalog, options);
}

export function buffConditions(catalog, { smoke = false, samples = 100 } = {}, profile = {}) {
    const school = profile.school ?? 'wudang';
    const base = publicForceConditions(catalog, {}, profile), result = [];
    const command = ability => ({ command: 'exert ' + ability });
    function add(force, ability, level, variant, extra = {}) {
        const original = base.find(c => c.id === `school-${school}-public-force-${force}-${ability}-l${level}`);
        assert.ok(original);
        const c = structuredClone(original), p = c.parameters;
        c.id = `school-${school}-buffs-${force}-${ability}-l${level}-${variant}`;
        c.samples = smoke ? 2 : extra.random ? samples : 2;
        p.collection_group = `${school}-buffs`; p.combination = variant;
        p.buff_steps = [command(ability)];
        p.qualification_sources.push('mudcore/inherit/dbase.c', 'feature/dbase.c');
        p.qualification_note = '非巫师真实USER经原exert调用公共强化。步骤内refill_neili为显式实验补给并留前后快照，不当作自然恢复或免费施法。无心跳、不手工删除标记、不构造过期；持久化仅用临时测试对象的原save_object/restore_object，不读取存档，不代替登录、断线或死亡全链。额外枪斧映射仅实验组合，不证明武当传授。';
        Object.assign(p.actor.skills, extra.skills);
        Object.assign(p.actor.mappings, extra.mappings);
        Object.assign(p.actor.properties, extra.properties);
        if (extra.selected) p.power_selected = extra.selected;
        if (extra.expected) p.expected = extra.expected;
        if (extra.steps) p.buff_steps = extra.steps;
        if (extra.persistence) p.persistence_probe = true;
        for (const skill of Object.values(extra.mappings ?? {})) {
            const source = catalog.skills.find(s => s.id === skill);
            assert.ok(source, '额外映射必须使用实际技能'); p.qualification_sources.push(source.path);
        }
        if (p.buff_steps.some(s => s.command === 'exert tianmo')) p.qualification_sources.push('kungfu/skill/force/tianmo.c');
        if (p.buff_steps.some(s => s.command === 'exert power')) p.qualification_sources.push('kungfu/skill/force/power.c');
        p.qualification_sources = [...new Set(p.qualification_sources)];
        result.push(c);
    }
    for (const force of profile.forces ?? ['taiji-shengong', 'wudang-xinfa', 'wudang-jiuyang']) {
        for (const ability of ['power', 'tianmo']) for (const level of ability === 'power' ? [200, 400, 800] : [400, 800]) {
            const amount = ability === 'power' ? 6000 : 8000;
            add(force, ability, level, 'repeat', { random: ability === 'tianmo',
                steps: [command(ability), command(ability), { refill_neili: amount }, command(ability)] });
        }
        for (const [usage, skill] of [['sword', profile.sword ?? 'taiji-jian'], ['hammer', 'hanshan-chuifa'],
            ['axe', 'pangu-qishi'], ['spear', 'zhongping-qiang']]) {
            add(force, 'power', 200, usage + '-highest', { skills: { [usage]: 800, [skill]: 800 },
                mappings: { [usage]: skill }, selected: ['axe', 'spear'].includes(usage) ? 'force' : usage });
        }
        for (const ability of ['power', 'tianmo']) add(force, ability, 400, 'persistence', { persistence: true });
        for (const first of ['power', 'tianmo']) {
            const second = first === 'power' ? 'tianmo' : 'power';
            add(force, first, 400, 'paired', { random: true, properties: { shen: -10000000, neili: 8000, max_neili: 8000 },
                steps: [command(first), { refill_neili: 8000 }, command(second),
                    { refill_neili: 8000 }, command(first), command(second)] });
        }
        for (const shen of [0, 1, 200000, -9999999]) add(force, 'tianmo', 400, 'shen-' + shen,
            { properties: { shen }, expected: 'refused' });
    }
    if (profile.note) for (const c of result) c.parameters.qualification_note = profile.note;
    return result;
}

const val = x => x ?? 0;
const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const sameResources = (b, a, except = []) => {
    for (const key of resources.filter(k => !except.includes(k))) assert.equal(a[key], b[key], key);
};
const stableTemp = state => { const t = structuredClone(state.temp); delete t.notify_fail; return t; };

export function validateWudangBuffRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.observe_seconds, 0); assert.equal(condition.method, 'exert');
    assert.equal(raw.outcome, p.expected); assert.deepEqual(raw.after, raw.immediate);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.callbacks.length, 0);
    assert.equal(raw.buff_steps.length, p.buff_steps.length);
    assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        assert.deepEqual(b.mappings, cfg.mappings);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(b.skills[key], value);
        for (const key of [...resources, 'str', 'int', 'con', 'dex', 'shen'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(b[key], cfg.properties[key]);
    }
    if (p.combination.endsWith('-highest')) {
        const usage = p.combination.split('-')[0];
        assert.ok(raw.before[0].effective_skills[usage] > raw.before[0].effective_skills.force);
    }
    const seen = new Set(); let totalCost = 0, refills = 0;
    for (const [i, step] of raw.buff_steps.entries()) {
        const plan = p.buff_steps[i], b = step.before, a = step.after;
        assert.deepEqual(step.operation, plan);
        assert.deepEqual(b, i ? raw.buff_steps[i - 1].after : raw.before[0], '步骤状态必须连续');
        assert.equal(a.object, b.object); assert.equal(a.busy, b.busy);
        if (plan.refill_neili !== undefined) {
            sameResources(b, a, ['neili']); assert.equal(a.neili, plan.refill_neili);
            assert.deepEqual(stableTemp(a), stableTemp(b)); refills += a.neili - b.neili;
            assert.equal(step.accepted, undefined); continue;
        }
        const ability = plan.command.split(' ')[1], success = !seen.has(ability) && p.expected === 'observed';
        assert.equal(step.accepted, Number(success));
        assert.equal(step.launches_after - step.launches_before, Number(success));
        if (!success) {
            assert.ok(step.reason); assert.ok(step.refusals_after > step.refusals_before);
            if (seen.has(ability)) assert.match(step.reason,
                ability === 'power' && b.neili < 100 ? /内力不够/ : /已经在运功中/);
            else if (p.expected === 'refused') assert.match(step.reason, /你还没有入魔/);
            sameResources(b, a); assert.deepEqual(stableTemp(a), stableTemp(b)); continue;
        }
        totalCost += b.neili; assert.equal(a.neili, 0);
        const apply = { ...b.temp.apply };
        if (ability === 'power') {
            sameResources(b, a, ['neili']);
            apply[p.power_selected] = val(apply[p.power_selected]) + Math.trunc(b.skills['martial-cognize'] / 5);
        } else {
            assert.equal(b.shen, -10000000);
            const low = b.skills.force + Math.trunc(Math.cbrt(-b.shen)), count = Math.trunc(low / 4);
            for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing'])
                assert.ok(b[key] - a[key] >= low && b[key] - a[key] <= low + 999);
            sameResources(b, a, ['neili', 'qi', 'eff_qi', 'jing', 'eff_jing']);
            for (const key of ['str', 'int', 'con', 'dex']) apply[key] = val(apply[key]) + b[key];
            apply.attack = val(apply.attack) + count;
            for (const key of ['damage', 'unarmed_damage']) apply[key] = val(apply[key]) + b.str * 3;
            for (const key of Object.keys(b.mappings)) apply[key] = val(apply[key]) + Math.trunc(count / 2);
        }
        assert.deepEqual(a.temp.apply, apply); assert.equal(a.temp[ability], 1); seen.add(ability);
    }
    assert.deepEqual(raw.immediate[0], raw.buff_steps.at(-1).after);
    assert.equal(raw.launches.length, seen.size); assert.ok(raw.launches.every(s => s.skill === 'force'));
    assert.equal(val(raw.metrics[0].neili_cost), totalCost);
    assert.equal(val(raw.metrics[0].neili_recovery), refills, '实验补给必须独立记账');
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing'])
        assert.equal(val(raw.metrics[0][key + '_cost']), raw.before[0][key] - raw.immediate[0][key]);
    sameResources(raw.before[1], raw.after[1]);
    if (p.persistence_probe) {
        const probe = raw.persistence;
        assert.equal(probe.restored, 1); assert.ok(probe.characters > 0); assert.match(probe.sha256, /^[a-f0-9]{64}$/);
        assert.notEqual(probe.after.object, raw.immediate[0].object);
        assert.deepEqual(probe.after.skills, raw.immediate[0].skills);
        assert.deepEqual(probe.after.mappings, raw.immediate[0].mappings);
        sameResources(raw.immediate[0], probe.after);
        assert.deepEqual(probe.after.temp, probe.before.temp, '新对象不会恢复nosave强化状态');
        assert.ok(!probe.after.temp?.power && !probe.after.temp?.tianmo);
        assert.equal(probe.after.interactive, 0, '仅存储语义探针，非重连验收');
    } else assert.equal(raw.persistence, undefined);
}
