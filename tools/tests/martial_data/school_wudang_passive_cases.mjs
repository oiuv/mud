// Controlled counter observations and a separate original-heartbeat bout.
import assert from 'node:assert/strict';
import { validateBoutRecord } from './bout_cases.mjs';

export const taijiEvents = raw => raw.taiji_events.filter(e => e.actor === 0 && e.target === 1);
export const taijiExtraAttacks = raw => raw.attacks.filter(a => a.actor === 0 && a.target === 1
    && [10, 30].includes(a.type));

export function wudangPassiveConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const source = catalog.skills.find(s => s.id === 'taiji-quan');
    assert.ok(source, '缺少太极拳源码');
    const result = [];
    function add(ability, level, counter, extra = {}) {
        const bout = ability === 'bout', reset = ability.startsWith('remove_');
        const method = bout ? 'bout' : ability === 'ordinary' ? 'ordinary' : 'interface';
        result.push({ id: `school-wudang-passive-${ability}-l${level}-c${counter}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method,
            samples: smoke ? 2 : bout ? 20 : reset || counter <= 10 ? 2 : samples,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-passive',
                combination: 'taiji-unarmed-neutral-force', skill: 'taiji-quan', usage: 'unarmed', ability, level,
                observation: bout ? 'original_heartbeat_bout' : 'single_action_immediate',
                actor: { skills: { unarmed: level, 'taiji-quan': level, parry: level, dodge: level, force: 600 },
                    mappings: { unarmed: 'taiji-quan', parry: 'taiji-quan' },
                    properties: { jiali: 0, neili: extra.neili ?? 6000, max_neili: 6000 },
                    ...(bout ? {} : { temp: { combat_time: counter, action_flag: extra.flag ?? 0, ...extra.temp } }) },
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                    mappings: {}, properties: { jiali: 0 }, equipment: { type: 'sword', hold: false } },
                action: method === 'interface' ? 'test_interface' : 'ordinary',
                ...(method === 'interface' ? { interface: { object: reset ? 'player' : '/kungfu/skill/taiji-quan',
                    function: reset ? ability : 'hit_ob' } } : {}),
                ...(bout ? { strategy: 'ordinary', first: 'alternating_index' } : {}),
                fighting: true, observe_seconds: bout ? (smoke ? 3 : 30) : 0,
                not_applicable: '', expected: 'observed',
                qualification_sources: [source.path, 'kungfu/class/wudang/zhang.c', 'feature/attack.c',
                    'feature/skill.c', 'feature/damage.c', 'inherit/char/char.c',
                    'adm/daemons/combatd.c', 'include/combat.h', 'kungfu/skill/sword.c'],
                qualification_note: '点测显式准备combat_time/action_flag及可选原有加成，不冒充自然经过的时间；combat_time是原attack()选中对手的次数。独立400级交锋从零开始、原USER心跳与30秒时钟、20场交替先手，含原生恢复。hit_ob返回空值，靠原分支与追加do_attack观测判断触发；10/30是原实参，不改成TYPE_QUICK。实验赋值、基本内功600与中性对手，不代表完整NPC配置或同培养成本。',
            } });
    }
    for (const level of [200, 400, 800]) for (const ability of ['hit_ob', 'ordinary'])
        for (const counter of [0, 10, 11, 20, 30]) add(ability, level, counter);
    for (const ability of ['hit_ob', 'ordinary']) {
        add(ability, 400, 20, { flag: 1, suffix: '-guarded' });
        add(ability, 400, 20, { neili: 0, suffix: '-neili0' });
    }
    add('hit_ob', 400, 20, { suffix: '-existing-bonus', temp: {
        'apply/attack': 17, 'apply/parry': 23, 'apply/unarmed_damage': 31 } });
    for (const ability of ['remove_enemy', 'remove_all_enemy']) add(ability, 400, 20);
    add('bout', 400, 0);
    return result;
}

const value = (state, key) => state.temp.apply?.[key] ?? 0;
const bonusKeys = ['attack', 'parry', 'unarmed_damage'];
export function validateAttackRoundCounts(raw) {
    for (const side of [0, 1]) {
        let count = 0;
        for (const round of raw.attack_rounds.filter(r => r.actor === side)) {
            assert.equal(round.before ?? 0, count);
            assert.equal(round.after ?? 0, (round.before ?? 0) + (round.result ? 1 : 0));
            count = round.after ?? 0;
        }
        if (raw.terminal === 'time_limit') assert.equal(raw.after[side].temp.combat_time ?? 0, count);
    }
}
export function validateWudangPassiveRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], bout = condition.method === 'bout';
    assert.equal(before.weapon, 'none');
    assert.equal(raw.launches.length, 0);
    for (const key of ['combat_time', 'action_flag']) assert.equal(before.temp[key] ?? 0, p.actor.temp?.[key] ?? 0);
    for (const key of bonusKeys) assert.equal(value(before, key), p.actor.temp?.['apply/' + key] ?? 0);
    const events = taijiEvents(raw), extra = taijiExtraAttacks(raw);
    assert.equal(events.length, raw.taiji_events.length, '本组只映射左方太极拳');
    if (p.ability.startsWith('remove_')) {
        assert.equal(raw.interfaces.length, 1); assert.equal(raw.interfaces[0].function, p.ability);
        assert.equal(raw.immediate[0].temp.combat_time ?? 0, 0);
        assert.equal(events.length, 0); assert.equal(raw.attacks.length, 0); return;
    }
    let entry, pending, triggers = 0;
    for (const e of events) {
        assert.ok(Number.isInteger(e.combat_time) && e.combat_time >= 0);
        assert.ok(Number.isInteger(e.attack_index) && e.attack_index >= 0 && e.attack_index <= raw.attacks.length);
        if (!bout) assert.equal(e.combat_time, p.actor.temp.combat_time);
        if (e.phase === 'enter') {
            if (pending) assert.equal(e.action_flag, 1, '追加攻击重入时须有防递归标记');
            else entry = e;
        } else if (e.phase === 'boosted') {
            assert.ok(entry && !pending && !entry.action_flag && entry.combat_time > 10);
            assert.equal(e.combat_time, entry.combat_time); assert.equal(e.action_flag, 1);
            for (const key of bonusKeys) assert.equal(e.apply[key] - entry.apply[key], e.combat_time * (key === 'unarmed_damage' ? 3 : 10));
            pending = { entry, boosted: e }; triggers++;
        } else if (e.phase === 'restored') {
            assert.ok(pending, '不得缺少原触发分支');
            assert.equal(e.action_flag ?? 0, 0); assert.equal(e.combat_time, pending.entry.combat_time);
            for (const key of bonusKeys) assert.equal(e.apply[key] ?? 0, pending.entry.apply[key] ?? 0,
                '恢复原有加成，而非无条件清零');
            const attacks = raw.attacks.slice(pending.boosted.attack_index, e.attack_index)
                .filter(a => a.actor === 0 && a.target === 1 && [10, 30].includes(a.type));
            assert.equal(attacks.length, 1, '一次蓄力恰有一次原公共追加攻击');
            pending = null; entry = null;
        } else assert.fail('未知蓄力观察阶段');
    }
    assert.ok(!pending, '临时加成必须恢复');
    assert.equal(extra.length, triggers, '不把命中、回调返回或初始攻击冒充追加攻击');
    for (const state of [raw.immediate[0], raw.after[0]]) {
        for (const key of bonusKeys) assert.equal(value(state, key), value(before, key));
        assert.equal(state.temp.action_flag ?? 0, before.temp.action_flag ?? 0);
    }
    if (bout) {
        validateBoutRecord(raw, condition);
        assert.equal(raw.interfaces.length, 0);
        validateAttackRoundCounts(raw);
    } else {
        assert.equal(raw.attack_rounds.length, 0, '直接do_attack与hit_ob不累加attack()计数');
        assert.equal(raw.after[0].temp.combat_time, p.actor.temp.combat_time);
        if (p.ability === 'hit_ob') {
            assert.equal(raw.interfaces.length, 1); assert.equal(raw.interfaces[0].function, 'hit_ob');
            assert.ok(!raw.interfaces[0].result, '原接口并不以返回真值报告触发');
            assert.equal(events.filter(e => e.phase === 'enter' && (e.action_flag ?? 0) === (p.actor.temp.action_flag ?? 0)).length >= 1, true);
        } else assert.ok(raw.attacks.some(a => a.actor === 0 && a.target === 1 && a.type === 0));
        if (p.actor.temp.combat_time <= 10 || p.actor.temp.action_flag) assert.equal(triggers, 0);
    }
}
