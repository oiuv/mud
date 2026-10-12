// Immediate public-force commands. Busy healing and special quest lookup have separate coverage.
import assert from 'node:assert/strict';
import { wudangForces } from './school_wudang_cultivation_cases.mjs';

export function wudangPublicForceConditions(catalog, options) {
    return publicForceConditions(catalog, options);
}

export function publicForceConditions(catalog, { smoke = false, samples = 100 } = {}, profile = {}) {
    const school = profile.school ?? 'wudang', family = profile.family ?? '武当派';
    const sword = profile.sword ?? 'taiji-jian';
    const result = [];
    function add(force, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === `force/${ability}`);
        const entry = source?.entries.find(e => e.role === 'exert')?.id;
        assert.ok(entry, '缺少公共内功入口：' + ability);
        const tianmo = ability === 'tianmo';
        const actor = {
            skills: { force: level, [force]: level, 'martial-cognize': level, ...profile.skills, ...extra.skills },
            mappings: { force, ...extra.mappings }, preparations: {},
            properties: { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
                max_jing: 10000, neili: tianmo ? 8000 : 6000, max_neili: tianmo ? 8000 : 6000,
                str: 36, int: 36, con: 36, dex: 36, jiali: 0, combat_exp: 100000000,
                shen: tianmo ? -10000000 : 200000, 'family/family_name': family, ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.noForceMap) delete actor.mappings.force;
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200 }, mappings: {}, preparations: {},
            properties: { qi: ability === 'lifeheal' ? 5000 : 10000,
                eff_qi: ability === 'lifeheal' ? 5000 : 10000, max_qi: 10000,
                jing: 10000, eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000,
                ...extra.targetProperties }, ...(extra.targetBusy ? { busy: 3 } : {}) };
        const other = extra.other ?? (ability === 'lifeheal' || ability === 'shot');
        result.push({ id: `school-${school}-public-force-${force}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method: 'exert', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school, family, collection_group: `${school}-public-force`,
                combination: extra.suffix ?? 'base', skill: force, usage: 'force', ability, level,
                actor, target, named_participants: true, observation: 'single_action_immediate',
                action: `exert ${ability}${other ? ' right' : ''}`, other,
                fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '',
                expected: extra.expected ?? 'observed', effect_expected: extra.effect ?? ability,
                power_selected: extra.powerSelected ?? 'force',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${force}.c`,
                    'kungfu/skill/force.c', 'cmds/skill/exert.c', 'inherit/skill/skill.c',
                    'feature/skill.c', 'feature/action.c', 'feature/damage.c', 'mudcore/inherit/action.c',
                    ...(profile.sources ?? ['kungfu/class/wudang/zhang.c']),
                    ...(extra.mappings?.sword ? [`kungfu/skill/${sword}.c`] : [])])],
                qualification_note: '真实非巫师USER经原exert回退公共force；三门武当内功分别测试，不借用完整九阳神功。等级、映射、邪气及资源为实验赋值，不证明自然养成或从师可得。lifeheal为存活受伤目标；dispel本批无异常状态，只采起手费与无作用分支，不代表毒伤已测。power/tianmo仅即时效果，不补造撤回时长；天魔正神值输入另查。roar/shot只采原白名单拒绝，不当作这两项技能的完整效果覆盖。',
            } });
    }
    for (const force of profile.forces ?? wudangForces) {
        for (const level of [200, 400, 800]) {
            add(force, 'lifeheal', level);
            add(force, 'power', level);
            add(force, 'dispel', level, { effect: 'no_condition_self', checks: 2 });
            add(force, 'dispel', level, { suffix: '-other', other: true, effect: 'no_condition_other', checks: 2 });
            add(force, 'tianmo', level, level === 200 ? { expected: 'refused', checks: 2 } : {});
        }
        for (const ability of profile.refusedAbilities ?? ['roar', 'shot']) add(force, ability, 800, {
            expected: 'refused', checks: 2, skills: { poison: 800, throwing: 800 },
        });
        for (const [suffix, extra] of [
            ['self', { other: false }], ['fighting', { fighting: true }], ['busy', { busy: true }],
            ['no-force-map', { noForceMap: true }], ['not-living', { targetProperties: { not_living: 1 } }],
            ['skill49', { skills: { [force]: 49 } }], ['max-neili299', { properties: { max_neili: 299 } }],
            ['neili149', { properties: { neili: 149 } }], ['healthy', { targetProperties: { qi: 10000, eff_qi: 10000 } }],
            ['severe', { targetProperties: { qi: 1999, eff_qi: 1999 } }],
        ]) add(force, 'lifeheal', 200, { ...extra, suffix: '-' + suffix, expected: 'refused', checks: 2 });
        for (const [suffix, extra] of [
            ['minimum', { skills: { [force]: 50 }, properties: { max_neili: 300, neili: 150 } }],
            ['fifth', { targetProperties: { qi: 2000, eff_qi: 2000 } }],
            ['small-wound', { targetProperties: { qi: 9999, eff_qi: 9999 } }],
            ['target-busy', { targetBusy: true }],
        ]) add(force, 'lifeheal', 200, { ...extra, suffix: '-' + suffix, checks: 2 });

        for (const [suffix, extra] of [
            ['other', { other: true }], ['neili99', { properties: { neili: 99 } }],
            ['effective199', { skills: { force: 198, [force]: 100 } }],
            ['cognize119', { skills: { 'martial-cognize': 119 } }],
            ['busy', { busy: true }], ['no-force-map', { noForceMap: true }],
        ]) add(force, 'power', 200, { ...extra, suffix: '-' + suffix, expected: 'refused', checks: 2 });
        add(force, 'power', 200, { suffix: '-minimum', skills: { force: 200, [force]: 100, 'martial-cognize': 120 },
            properties: { neili: 100 }, checks: 2 });
        add(force, 'power', 200, { suffix: '-fighting', fighting: true, checks: 2 });
        add(force, 'power', 200, { suffix: '-sword-highest', skills: { sword: 400, [sword]: 400 },
            mappings: { sword }, powerSelected: 'sword', checks: 2 });
        add(force, 'power', 200, { suffix: '-sword-tie', skills: { sword: 200, [sword]: 200 },
            mappings: { sword }, checks: 2 });
        add(force, 'power', 200, { suffix: '-sword-unmapped', skills: { sword: 800, [sword]: 800 }, checks: 2 });

        for (const [suffix, extra] of [
            ['neili299', { properties: { neili: 299 }, effect: 'accepted_no_effect' }],
            ['other-neili299', { other: true, properties: { neili: 299 }, effect: 'accepted_no_effect' }],
            ['other-busy', { other: true, targetBusy: true, effect: 'accepted_no_effect' }],
            ['other-fighting', { other: true, fighting: true, effect: 'accepted_no_effect' }],
            ['minimum', { properties: { neili: 300 }, effect: 'no_condition_self' }],
            ['other-minimum', { other: true, properties: { neili: 300 }, effect: 'no_condition_other' }],
        ]) add(force, 'dispel', 200, { ...extra, suffix: '-' + suffix, checks: 2 });

        for (const [suffix, extra] of [
            ['neili7999', { properties: { neili: 7999 } }],
            ['shen-limit', { properties: { shen: -9999999 } }],
            ['both-attributes29', { properties: { str: 29, con: 29 } }],
            ['force299', { skills: { force: 299 } }],
            ['cognize299', { skills: { 'martial-cognize': 299 } }],
            ['busy', { busy: true }], ['no-force-map', { noForceMap: true }],
        ]) add(force, 'tianmo', 400, { ...extra, suffix: '-' + suffix, expected: 'refused', checks: 2 });
        add(force, 'tianmo', 300, { suffix: '-minimum', checks: 2 });
        add(force, 'tianmo', 400, { suffix: '-str30-con29', properties: { str: 30, con: 29 }, checks: 2 });
        add(force, 'tianmo', 400, { suffix: '-str29-con30', properties: { str: 29, con: 30 }, checks: 2 });
        add(force, 'tianmo', 400, { suffix: '-fighting', fighting: true, checks: 2 });
        add(force, 'tianmo', 400, { suffix: '-extra-neili', properties: { neili: 9000 }, checks: 2 });
        add(force, 'tianmo', 400, { suffix: '-sword-map', skills: { sword: 400, [sword]: 400 },
            mappings: { sword }, checks: 2 });
    }
    if (profile.note) for (const c of result) c.parameters.qualification_note = profile.note;
    return result;
}

const resourceKeys = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const val = x => x ?? 0;
const sameResources = (before, after, except = []) => {
    for (const key of resourceKeys.filter(k => !except.includes(k))) assert.equal(after[key], before[key], key);
};

export function validateWudangPublicForceRecord(raw, condition) {
    const p = condition.parameters, [b, bt] = raw.before, [a, t] = raw.immediate;
    assert.equal(condition.method, 'exert');
    assert.equal(p.observe_seconds, 0, '即时采集不证明持续效果');
    assert.equal(raw.outcome, p.expected);
    assert.deepEqual(raw.after, raw.immediate, '即时结果不能混入未观察的后续变化');
    assert.equal(raw.attacks.length, 0);
    assert.equal(raw.interfaces.length, 0);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side];
        assert.equal(before.weapon, 'none');
        assert.deepEqual(before.mappings, cfg.mappings);
        for (const [skill, level] of Object.entries(cfg.skills)) assert.equal(before.skills[skill], level);
        for (const key of resourceKeys) assert.equal(before[key], cfg.properties[key]);
        assert.ok(!before.conditions || Object.keys(before.conditions).length === 0, '本批仅无异常状态');
        for (const key of ['str', 'int', 'con', 'dex', 'shen']) {
            if (Object.hasOwn(cfg.properties, key)) assert.equal(before[key], cfg.properties[key]);
        }
    }
    if (raw.outcome === 'refused') {
        assert.equal(raw.launches.length, 0);
        assert.ok(raw.reason);
        for (const [before, after, metrics] of [[b, a, raw.metrics[0]], [bt, t, raw.metrics[1]]]) {
            sameResources(before, after);
            assert.equal(val(metrics.neili_cost), 0);
            assert.equal(after.busy, before.busy);
            const oldTemp = { ...before.temp }, newTemp = { ...after.temp };
            delete oldTemp.notify_fail; delete newTemp.notify_fail;
            assert.deepEqual(newTemp, oldTemp);
        }
        return;
    }
    assert.equal(raw.launches.length, 1);
    assert.equal(raw.launches[0].skill, 'force', '不能把公共能力标为门派专属');
    assert.equal(raw.command_accepted, 1);
    assert.equal(val(raw.metrics[1].neili_cost), 0);
    const cost = val(raw.metrics[0].neili_cost);
    const apply = { ...b.temp.apply };
    switch (p.ability) {
        case 'lifeheal': {
            assert.equal(cost, 150);
            assert.equal(a.neili, b.neili - 150);
            sameResources(b, a, ['neili']);
            const force = b.effective_skills.force;
            assert.equal(t.eff_qi, Math.min(bt.max_qi, bt.eff_qi + 10 + Math.trunc(force / 2)));
            assert.equal(t.qi, Math.min(t.eff_qi, bt.qi + 10 + Math.trunc(force / 3)));
            sameResources(bt, t, ['qi', 'eff_qi']);
            assert.equal(a.busy, b.busy); assert.equal(t.busy, bt.busy);
            assert.deepEqual(a.temp.apply, b.temp.apply);
            break;
        }
        case 'dispel': {
            const none = p.effect_expected === 'accepted_no_effect';
            assert.equal(cost, none ? 0 : p.other ? 250 : 100);
            assert.equal(a.neili, b.neili - cost);
            sameResources(b, a, ['neili']); sameResources(bt, t);
            assert.equal(a.busy, none ? b.busy : p.other ? 2 : 1);
            assert.equal(t.busy, none || !p.other ? bt.busy : 1);
            assert.deepEqual(a.conditions, b.conditions); assert.deepEqual(t.conditions, bt.conditions);
            assert.deepEqual(a.temp.apply, b.temp.apply);
            break;
        }
        case 'power': {
            const selected = p.power_selected;
            assert.ok(['force', 'sword'].includes(selected) && b.mappings[selected]);
            if (selected === 'sword') assert.ok(b.effective_skills.sword > b.effective_skills.force);
            else if (b.mappings.sword) assert.ok(b.effective_skills.sword <= b.effective_skills.force);
            assert.equal(cost, b.neili); assert.equal(a.neili, 0);
            sameResources(b, a, ['neili']); sameResources(bt, t);
            apply[selected] = val(apply[selected]) + Math.trunc(b.skills['martial-cognize'] / 5);
            assert.deepEqual(a.temp.apply, apply); assert.equal(a.temp.power, 1);
            assert.ok(p.fighting ? a.busy >= 1 && a.busy <= 3 : !a.busy);
            break;
        }
        case 'tianmo': {
            // This positive-base boundary is not an oracle for negative-base pow().
            assert.equal(b.shen, -10000000);
            const evilLevel = Math.trunc(Math.pow(-b.shen, 1 / 3));
            const low = b.skills.force + evilLevel, count = Math.trunc(low / 4);
            assert.equal(cost, b.neili); assert.equal(a.neili, 0);
            for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) {
                const loss = b[key] - a[key];
                assert.ok(loss >= low && loss <= low + 999, '天魔原自损范围：' + key);
                assert.equal(raw.metrics[0][key + '_cost'], loss);
            }
            assert.ok(a.qi <= a.eff_qi && a.jing <= a.eff_jing, '原创伤会限制当前值');
            sameResources(b, a, ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']); sameResources(bt, t);
            for (const key of ['str', 'int', 'con', 'dex']) apply[key] = val(apply[key]) + b[key];
            apply.attack = val(apply.attack) + count;
            for (const key of ['damage', 'unarmed_damage']) apply[key] = val(apply[key]) + b.str * 3;
            for (const key of Object.keys(b.mappings)) apply[key] = val(apply[key]) + Math.trunc(count / 2);
            assert.deepEqual(a.temp.apply, apply); assert.equal(a.temp.tianmo, 1);
            assert.ok(p.fighting ? a.busy >= 1 && a.busy <= 3 : !a.busy);
            break;
        }
        default: assert.fail('未核对的公共成功入口：' + p.ability);
    }
}
