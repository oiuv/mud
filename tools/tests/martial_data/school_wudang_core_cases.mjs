// Original Taiji fist and force commands; no replacement combat or healing formulas.
import assert from 'node:assert/strict';

export function wudangCoreConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary'
            : ['powerup', 'shield', 'dian'].includes(ability) ? 'exert' : 'perform';
        const skill = method === 'exert' ? 'taiji-shengong' : 'taiji-quan';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? skill : `${skill}/${ability}`));
        assert.ok(source, '缺少原太极拳/神功源码');
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry, '缺少原技能入口');
        const actor = {
            skills: { unarmed: level, parry: level, dodge: level, force: level,
                'taiji-quan': level, 'taiji-shengong': level, tiyunzong: level,
                taoism: level, 'martial-cognize': level, ...extra.skills },
            mappings: { unarmed: 'taiji-quan', parry: 'taiji-quan', force: 'taiji-shengong', dodge: 'tiyunzong' },
            preparations: extra.unprepared ? {} : { unarmed: 'taiji-quan' },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, jingli: 6000, int: 36, con: 36,
                combat_exp: 100000000, shen: 200000, 'family/family_name': '武当派',
                ...(['perform'].includes(method) || ability === 'dian'
                    ? { [`can_perform/${skill}/${ability}`]: ability === 'tu' ? 10 : 1 } : {}),
                ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.noForceMap) delete actor.mappings.force;
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200 }, mappings: {},
            properties: { ...(ability === 'dian' ? { qi: 5000, eff_qi: 5000, jing: 5000, eff_jing: 5000 } : {}),
                ...extra.targetProperties }, equipment: { type: 'sword', hold: false },
            ...(extra.targetBusy ? { busy: 3 } : {}) };
        result.push({ id: `school-wudang-core-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? (extra.expiry ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-core',
                combination: extra.suffix ?? 'base', skill, usage: method === 'exert' ? 'force' : 'unarmed',
                ability, level, actor, target, named_participants: true,
                observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                action: method === 'ordinary' ? 'ordinary' : method === 'perform' ? `perform unarmed.${ability}`
                    : `exert ${ability}${extra.self ? '' : ability === 'dian' || extra.other ? ' right' : ''}`,
                fighting: extra.fighting ?? ability !== 'dian',
                observe_seconds: extra.expiry ? actor.skills['taiji-shengong'] + 2 : 0,
                not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [...new Set([source.path, 'kungfu/skill/taiji-quan.c',
                    'kungfu/skill/taiji-shengong.c', 'kungfu/skill/tiyunzong.c', 'kungfu/class/wudang/zhang.c',
                    'cmds/skill/perform.c', 'cmds/skill/exert.c', 'inherit/skill/skill.c', 'feature/action.c',
                    'feature/skill.c', 'feature/damage.c', 'inherit/char/char.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER经原perform/exert；参考张三丰的太极拳/神功/梯云纵，不复制NPC专属属性。等级、领悟与资源仅实验赋值，不证明师承或同培养成本。太极图领悟10，200级原档被拒，合法边界另列；本批太极图仅一名敌人，未代替多目标测试。疗伤对存活受伤玩家，未代替昏迷唤醒测试。重复增益与后续被动另列待采，不据即时结果宣称全部回调完成。',
            } });
    }
    for (const level of [200, 400, 800]) {
        for (const move of ['ordinary', 'ji', 'yin', 'zhan', 'zhen', 'powerup', 'shield', 'dian']) add(move, level);
        add('tu', level, level === 200 ? { expected: 'refused', checks: 2 } : {});
    }
    for (const move of ['ji', 'yin', 'zhan', 'zhen', 'tu']) {
        const base = move === 'tu' ? 400 : 200, minimum = move === 'tu' ? 250 : 150;
        const neili = move === 'tu' ? 1000 : 200;
        for (const [suffix, extra] of [
            ['no-grant', { properties: { [`can_perform/taiji-quan/${move}`]: 0 } }],
            ['low-skill', { skills: { 'taiji-quan': minimum - 1 } }],
            ['low-neili', { properties: { neili: neili - 1 } }],
            ['weapon', { weapon: true }], ['busy', { busy: true }],
            ['unprepared', { unprepared: true }], ['no-fight', { fighting: false }],
        ]) add(move, base, { ...extra, suffix: '-' + suffix, expected: 'refused', checks: 2 });
        add(move, base, { suffix: '-minimum-skill', skills: { 'taiji-quan': minimum }, checks: 2 });
        add(move, base, { suffix: '-minimum-neili', properties: { neili }, checks: 2 });
    }
    for (const move of ['yin', 'zhan']) add(move, 200, { suffix: '-target-busy', targetBusy: true,
        expected: move === 'yin' ? 'refused' : 'observed', checks: 2 });
    for (const [suffix, extra] of [
        ['grant9', { properties: { 'can_perform/taiji-quan/tu': 9 } }],
        ['low-force', { skills: { 'taiji-shengong': 299 } }],
        ['low-taoism', { skills: { taoism: 299 } }],
        ['low-jingli', { properties: { jingli: 999 } }], ['no-force-map', { noForceMap: true }],
    ]) add('tu', 400, { ...extra, suffix: '-' + suffix, expected: 'refused', checks: 2 });
    add('tu', 300, { suffix: '-minimum', skills: { 'taiji-quan': 250 },
        properties: { neili: 1000, jingli: 1000 }, checks: 2 });
    add('tu', 400, { suffix: '-target-neili100', targetProperties: { neili: 100 }, checks: 2 });
    for (const move of ['powerup', 'shield']) {
        const minimum = move === 'powerup' ? 150 : 100;
        for (const [suffix, extra] of [
            ['low-neili', { properties: { neili: minimum - 1 } }],
            ['busy', { busy: true }], ['other', { other: true }], ['no-force-map', { noForceMap: true }],
        ]) add(move, 200, { ...extra, suffix: '-' + suffix, expected: 'refused', checks: 2 });
        add(move, 200, { suffix: '-minimum-neili', properties: { neili: minimum }, checks: 2 });
        add(move, 200, { suffix: '-peace', fighting: false, checks: 2 });
        add(move, 50, { suffix: '-expiry', expiry: true, checks: 2 });
    }
    add('shield', 200, { suffix: '-low-skill', skills: { 'taiji-shengong': 49 }, expected: 'refused', checks: 2 });
    add('shield', 200, { suffix: '-minimum-skill', skills: { 'taiji-shengong': 50 }, checks: 2 });
    for (const [suffix, extra] of [
        ['no-grant', { properties: { 'can_perform/taiji-shengong/dian': 0 } }],
        ['low-skill', { skills: { 'taiji-shengong': 99 } }],
        ['low-max-neili', { properties: { max_neili: 1499 } }],
        ['low-neili', { properties: { neili: 999 } }], ['low-jing', { properties: { jing: 99 } }],
        ['self', { self: true }], ['fighting', { fighting: true }], ['busy', { busy: true }],
        ['not-living', { targetProperties: { not_living: 1 } }],
        ['healthy', { targetProperties: { eff_qi: 10000, eff_jing: 10000 } }],
    ]) add('dian', 200, { ...extra, suffix: '-' + suffix, expected: 'refused', checks: 2 });
    add('dian', 200, { suffix: '-minimum', skills: { 'taiji-shengong': 100 },
        properties: { max_neili: 1500, neili: 1000, jing: 100 }, checks: 2 });
    add('dian', 200, { suffix: '-target-busy', targetBusy: true, checks: 2 });
    add('dian', 200, { suffix: '-qi-only', targetProperties: { eff_jing: 10000 }, checks: 2 });
    add('dian', 200, { suffix: '-jing-only', targetProperties: { eff_qi: 10000 }, checks: 2 });
    add('dian', 200, { suffix: '-small-wound', targetProperties: { eff_qi: 9999, eff_jing: 9999 }, checks: 2 });
    return result;
}

export function validateWudangCoreRecord(raw, condition) {
    const p = condition.parameters, b = raw.before[0], bt = raw.before[1];
    const a = raw.immediate[0], t = raw.immediate[1], cost = raw.metrics[0].neili_cost ?? 0;
    const direct = raw.metrics[0].direct ?? 0;
    const delta = (s, key) => (s.temp.apply?.[key] ?? 0) - (b.temp.apply?.[key] ?? 0);
    assert.equal(b.weapon, p.actor.equipment?.type ?? 'none');
    assert.deepEqual(b.preparations, p.actor.preparations);
    assert.equal(b.jingli, p.actor.properties.jingli);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(raw.launches.length, 0); assert.equal(raw.attacks.length, 0);
        assert.ok(raw.reason.length > 0);
        for (const [before, after] of [[b, a], [bt, t]]) {
            for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili', 'jingli']) assert.equal(after[key], before[key]);
            const x = { ...before.temp }, y = { ...after.temp }; delete x.notify_fail; delete y.notify_fail;
            assert.deepEqual(y, x);
        }
        return;
    }
    if (condition.method === 'ordinary') { assert.equal(raw.launches.length, 0); return; }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill);
    assert.equal(a.weapon, 'none'); assert.ok(direct === 0 || direct === 1);
    if (p.ability !== 'tu') assert.equal(a.jingli, b.jingli);
    switch (p.ability) {
        case 'ji':
            assert.equal(cost, direct ? 30 : 10); assert.equal(a.busy, direct ? 2 : 4);
            assert.equal(raw.metrics[1].jing_cost ?? 0, raw.metrics[1].eff_jing_cost ?? 0);
            if (direct) assert.ok((raw.metrics[1].jing_cost ?? 0) >= Math.trunc(b.skills['taiji-quan'] / 2));
            break;
        case 'yin':
        case 'zhan': {
            const yin = p.ability === 'yin';
            assert.equal(cost, direct ? (yin ? 80 : 30) : (yin ? 60 : 10));
            assert.equal(a.busy, direct ? (yin ? 1 : 2) : 3);
            if (bt.busy) assert.equal(t.busy, bt.busy);
            else if (t.busy) assert.equal(t.busy, Math.trunc(b.effective_skills.unarmed / (yin ? 30 : 50)) + (yin ? 2 : 1));
            break;
        }
        case 'zhen':
            assert.equal(cost, 50); assert.equal(a.busy, 3);
            assert.ok((t.busy ?? 0) >= 0 && (t.busy ?? 0) <= 2);
            if (!direct) assert.ok(!t.busy);
            break;
        case 'tu': {
            assert.equal(cost, 1000); assert.equal(b.jingli - a.jingli, 1000);
            assert.equal(a.busy, 4); assert.equal(direct, 0); // Uses original receive_damage, not do_damage.
            const damage = raw.metrics[1].qi_cost ?? 0;
            assert.equal(t.busy ?? 0, damage ? 3 : 0);
            assert.equal(t.neili, Math.max(0, bt.neili - (damage ? 500 : 200)));
            assert.equal(raw.metrics[1].eff_qi_cost ?? 0, Math.trunc(damage / 2));
            assert.equal(raw.metrics[1].jing_cost ?? 0, Math.trunc(damage / 3));
            assert.equal(raw.metrics[1].eff_jing_cost ?? 0, Math.trunc(damage / 6));
            break;
        }
        case 'dian': {
            assert.equal(cost, 800); assert.equal(raw.metrics[0].qi_cost, 100); assert.equal(raw.metrics[0].jing_cost, 50);
            assert.equal(a.busy, 10); assert.equal(t.busy ?? 0, bt.busy ?? 0); // MA-007: original stary_busy is absent.
            assert.equal(t.qi, bt.qi); assert.equal(t.jing, bt.jing);
            const force = b.effective_skills.force, skill = b.skills['taiji-shengong'];
            assert.equal(t.eff_qi, Math.min(bt.max_qi, bt.eff_qi + 100 + force + skill * 3));
            assert.equal(t.eff_jing, Math.min(bt.max_jing, bt.eff_jing + 100 + Math.trunc(force / 3) + skill));
            break;
        }
        case 'powerup':
        case 'shield': {
            const power = p.ability === 'powerup', fields = power ? ['attack', 'defense'] : ['armor'];
            const skill = b.skills['taiji-shengong'];
            assert.equal(cost, 100); assert.equal(a.qi, b.qi); assert.equal(a.temp[p.ability], 1);
            for (const key of fields) assert.equal(delta(a, key), Math.trunc(skill / (power ? 3 : 2)));
            if (!p.fighting) assert.ok(!a.busy);
            else if (power) assert.ok(a.busy >= 1 && a.busy <= 3);
            else assert.equal(a.busy, 2);
            if (p.observation === 'timed_effect') {
                const callbacks = raw.callbacks.filter(c => c.side === 0);
                assert.equal(callbacks.length, 2); assert.equal(callbacks[0].phase, 'before'); assert.equal(callbacks[1].phase, 'after');
                assert.ok(raw.elapsed >= p.observe_seconds - 1 && callbacks[0].elapsed >= skill - 1);
                assert.ok(callbacks[0].elapsed <= callbacks[1].elapsed && callbacks[1].elapsed <= raw.elapsed);
                assert.equal(callbacks[0].state.temp[p.ability], 1);
                for (const s of [callbacks[1].state, raw.after[0]]) {
                    assert.ok(!s.temp[p.ability]); assert.equal(s.neili, a.neili);
                    for (const key of fields) assert.equal(delta(s, key), 0);
                }
            }
            break;
        }
        default: assert.fail('未核对太极拳/神功入口');
    }
}
