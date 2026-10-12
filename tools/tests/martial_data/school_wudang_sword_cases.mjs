// Original Taiji sword actions; no replacement formulas, timers or teaching claims.
import assert from 'node:assert/strict';

export const wudangSwordMoves = [
    ['chan', 80, 60], ['jia', 150, 200], ['sui', 60, 300],
    ['zhenwu', 180, 200], ['zhuan', 160, 250],
];

export function wudangSwordConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id ===
            (method === 'ordinary' ? 'taiji-jian' : `taiji-jian/${ability}`));
        assert.ok(source, '缺少太极剑原源码');
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry, '缺少太极剑真实入口');
        const actor = {
            skills: { sword: level, parry: level, dodge: level, force: level,
                'taiji-jian': level, 'taiji-shengong': level, tiyunzong: level,
                'taiji-quan': 100, taoism: level, 'martial-cognize': level, ...extra.skills },
            mappings: { sword: 'taiji-jian', parry: 'taiji-jian', force: 'taiji-shengong', dodge: 'tiyunzong' },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, int: 36, con: 36,
                combat_exp: 100000000, shen: 200000, 'family/family_name': '武当派',
                ...(method === 'perform' ? { [`can_perform/taiji-jian/${ability}`]: 1 } : {}),
                ...extra.properties },
            ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? 'sword', hold: false } }),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        result.push({ id: `school-wudang-sword-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? (extra.expiry ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-sword',
                combination: extra.suffix ?? 'base', skill: 'taiji-jian', usage: 'sword', ability, level,
                actor, target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                    mappings: {}, properties: { shen: extra.badTarget ? -200000 : 0 },
                    ...(extra.unarmedTarget ? {} : { equipment: { type: 'sword', hold: false } }),
                    ...(extra.targetBusy ? { busy: 3 } : {}) },
                observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                action: method === 'ordinary' ? 'ordinary' : `perform sword.${ability}`,
                fighting: extra.fighting ?? true, observe_seconds: extra.expiry ? Math.trunc(level / 3) + 2 : 0,
                not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [...new Set([source.path, 'kungfu/skill/taiji-jian.c',
                    'kungfu/skill/taiji-shengong.c', 'kungfu/skill/tiyunzong.c', 'kungfu/skill/taiji-quan.c',
                    'kungfu/class/wudang/zhang.c', 'cmds/skill/perform.c', 'feature/action.c',
                    'feature/skill.c', 'feature/damage.c', 'inherit/char/char.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；参考张三丰太极剑/太极神功/梯云纵映射，只采该组合而非复制NPC。技能、领悟、正气和资源为实验赋值，不证明拜师、教学或同养成成本。等级门槛对照只测试施展资格；普攻极意保留原首次加载全局表，不重算随机系数。随字诀到期使用原秒数，其他条件只取即时效果。',
            } });
    }
    for (const level of [200, 400, 800]) {
        for (const move of ['ordinary', ...wudangSwordMoves.map(m => m[0])]) add(move, level);
        add('zhenwu', level, { suffix: '-bad-target', badTarget: true });
    }
    for (const [move, minimum, neili] of wudangSwordMoves) {
        for (const [suffix, extra] of [
            ['no-grant', { properties: { [`can_perform/taiji-jian/${move}`]: 0 } }],
            ['low-neili', { properties: { neili: neili - 1 } }],
            ['low-skill', { skills: { 'taiji-jian': minimum - 1 } }],
            ['no-weapon', { noWeapon: true }], ['wrong-weapon', { weapon: 'blade' }], ['busy', { busy: true }],
            ...(move === 'sui' ? [] : [['no-fight', { fighting: false }]]),
        ]) add(move, 200, { suffix: '-' + suffix, ...extra, expected: 'refused', checks: 2 });
        add(move, 200, { suffix: '-minimum-skill', skills: { 'taiji-jian': minimum }, checks: 2 });
        add(move, 200, { suffix: '-minimum-neili', properties: { neili }, checks: 2 });
    }
    for (const move of ['chan', 'jia']) add(move, 200,
        { suffix: '-target-busy', targetBusy: true, checks: 2, expected: 'refused' });
    add('jia', 200, { suffix: '-unarmed-target', unarmedTarget: true, checks: 2, expected: 'refused' });
    add('sui', 200, { suffix: '-peace', fighting: false, checks: 2 });
    for (const level of [60, 200]) add('sui', level, { suffix: '-expiry', expiry: true, checks: 2 });
    return result;
}

export function validateWudangSwordRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0], target = raw.immediate[1];
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    const level = p.actor.skills['taiji-jian'];
    const delta = (state, key) => (state.temp.apply?.[key] ?? 0) - (before.temp.apply?.[key] ?? 0);
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    assert.equal(actor.max_neili, before.max_neili);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(raw.launches.length, 0); assert.equal(raw.attacks.length, 0);
        // The host notify_fail sefun stores its message in temp; it is not a buff.
        const afterTemp = { ...actor.temp }, beforeTemp = { ...before.temp };
        delete afterTemp.notify_fail; delete beforeTemp.notify_fail;
        assert.deepEqual(afterTemp, beforeTemp); assert.ok(raw.reason.length > 0);
        return;
    }
    assert.equal(actor.weapon, 'sword');
    if (condition.method === 'ordinary') { assert.equal(raw.launches.length, 0); return; }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, 'taiji-jian');
    assert.ok(direct === 0 || direct === 1);
    if (p.ability !== 'sui') assert.equal(delta(actor, 'attack'), 0);
    switch (p.ability) {
        case 'chan':
            assert.equal(cost, 30); assert.equal(direct, 0);
            if (target.busy > 0) {
                assert.equal(target.busy, Math.trunc(level / 16) + 2); assert.ok(!actor.busy);
            } else assert.equal(actor.busy, 2);
            break;
        case 'jia':
            assert.equal(cost, direct ? 80 : 60); assert.equal(actor.busy, direct ? 1 : 3);
            if (target.busy > 0) assert.equal(target.busy, Math.trunc(before.effective_skills.sword / 30) + 2);
            break;
        case 'sui': {
            assert.equal(cost, 100); assert.equal(direct, 0); assert.equal(actor.temp.tjj_sui, 1);
            assert.equal(delta(actor, 'defense'), Math.trunc(level / 3));
            assert.equal(delta(actor, 'attack'), -Math.trunc(level / 6));
            assert.equal(actor.busy ?? 0, p.fighting ? 3 : 0);
            if (p.observation === 'timed_effect') {
                // execution.mjs freezes a 1000 ms game tick. call_out targets a
                // tick, not the exact wall-clock instant when it was scheduled.
                const tickSeconds = 1;
                assert.ok(raw.elapsed >= p.observe_seconds - tickSeconds);
                const callbacks = raw.callbacks.filter(c => c.side === 0);
                assert.equal(callbacks.length, 2); assert.equal(callbacks[0].phase, 'before');
                assert.equal(callbacks[1].phase, 'after');
                assert.ok(callbacks[0].elapsed >= Math.trunc(level / 3) - tickSeconds);
                assert.ok(callbacks[1].elapsed >= callbacks[0].elapsed);
                assert.ok(raw.elapsed >= callbacks[1].elapsed);
                assert.equal(callbacks[0].state.temp.tjj_sui, 1);
                assert.ok(!callbacks[1].state.temp.tjj_sui && !raw.after[0].temp.tjj_sui);
                for (const state of [callbacks[1].state, raw.after[0]])
                    for (const key of ['attack', 'defense']) assert.equal(delta(state, key), 0);
                assert.equal(raw.after[0].neili, actor.neili);
            }
            break;
        }
        case 'zhenwu':
            assert.equal(cost, 50); assert.equal(actor.busy, 2);
            if (!direct) {
                assert.equal(raw.metrics[1].jing_cost ?? 0, 0);
                assert.equal(raw.metrics[1].eff_jing_cost ?? 0, 0);
            }
            break;
        case 'zhuan': {
            const regular = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
            assert.ok(regular.length >= 5 && regular.length <= 10);
            assert.equal(cost, regular.length * 20);
            assert.ok(actor.busy >= 1 && actor.busy <= regular.length);
            break;
        }
        default: assert.fail('未核对的太极剑绝招');
    }
}
