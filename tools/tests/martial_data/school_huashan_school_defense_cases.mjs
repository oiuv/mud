// S6 school-level Huashan defense: original zixia powerup prelude, then one
// original regular attack round per sample across multiple attacker weapon types.
// Attacker is side 0, school defender is side 1; no strength ranking is implied.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const huashanSchoolDefenseGroup = 'huashan-school-defense';

const reviewedSources = {
    'kungfu/skill/zixia-shengong/powerup.c': '0dd7e762f7ac9fca0c6e3b00e117789b0dd2ce4ee0bba96fa5c9eac52701cf06',
    'kungfu/skill/huashan-jian.c': '249af2a2ae8973d2c10111eb62f6199403ce4de17011d1b5c70f02e3309fbdcb',
    'kungfu/skill/huashan-shenfa.c': '8c0ff7c7bd33642a0259a47661c0d7b8edf27998678139285113a7b6f1f53a84',
    'kungfu/skill/zixia-shengong.c': 'd509b651c717a09ff02bccdda4db3112c2feb1dcb724df0b7b2750691ff301b2',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
    'feature/damage.c': '1a57abfa577c4043909cf6f443fd070fb51b3128c4e33ed070809862db200a53',
    'inherit/weapon/blade.c': '959922ba778fb8531cea4c17e35a93e4e6c85a9b23924b08fcb3af8b811d3ed9',
    'inherit/weapon/pin.c': 'f9bce63b3f093633e9533ab067889f31411fd823e1efc3a43ff84043ccfa1ab8',
};

export function huashanSchoolDefenseConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    for (const [path, hash] of Object.entries(reviewedSources)) {
        const source = readSource(path);
        assert.ok(source, 'missing reviewed source: ' + path);
        assert.equal(createHash('sha256').update(source).digest('hex'), hash, 'reviewed source hash ' + path);
    }
    const entry = catalog.skills.find(s => s.id === 'huashan-jian');
    assert.ok(entry, '华山剑法不在目录');
    const result = [];
    for (const level of [200, 400, 800]) for (const type of ['sword', 'blade', 'pin', 'none']) {
        result.push({
            id: `school-huashan-school-defense-${type}-l${level}`,
            stage: 'school',
            entry_id: entry.path,
            method: 'ordinary',
            samples: smoke ? 2 : samples,
            parameters: {
                school: 'huashan',
                family: '华山派',
                collection_group: huashanSchoolDefenseGroup,
                level,
                attack_type: type,
                observation: 'single_action_immediate',
                school_defense_prelude: 1,
                actor: {
                    // 'pin' has no basic skill object; the pin weapon carries the round itself.
                    skills: { force: 600, dodge: 600, parry: 600, sword: 200, blade: 200, unarmed: 200, strike: 200 },
                    mappings: {}, preparations: {},
                    properties: { jiali: 0, neili: 6000, max_neili: 6000 },
                    ...(type === 'none' ? {} : { equipment: { type, hold: false } }),
                },
                target: {
                    skills: { 'zixia-shengong': level, 'huashan-jian': level, 'huashan-shenfa': level,
                        force: level, sword: level, dodge: level, parry: level },
                    mappings: { sword: 'huashan-jian', force: 'zixia-shengong', dodge: 'huashan-shenfa', parry: 'huashan-jian' },
                    preparations: {},
                    properties: { jiali: 0, neili: 6000, max_neili: 6000, 'family/family_name': '华山派' },
                    equipment: { type: 'sword', hold: false },
                },
                action: 'ordinary',
                fighting: true,
                observe_seconds: 0,
                not_applicable: '',
                qualification_sources: [...new Set([...Object.keys(reviewedSources), 'kungfu/skill/sword.c',
                    'feature/action.c', 'feature/equip.c', 'inherit/weapon/sword.c', 'cmds/skill/exert.c'])],
                qualification_note: '左方中性进攻者按原兵器类别各施一轮原普通攻击，右方华山门派配置（紫霞/华山剑法/华山身法）先经原exert powerup建立增益再入敌对。'
                    + '逐条记录原攻击轮命中/招架/闪避与伤害、增益+level/3增量及100内力支出；不比较类型强弱、不排名，单轮不代表完整交锋或胜负，增益到期另由重施窗口覆盖。',
                expected: 'observed',
            },
        });
    }
    return result;
}

export function validateHuashanSchoolDefenseRecord(raw, condition) {
    const p = condition.parameters, [attacker, defender] = raw.before;
    assert.equal(p.collection_group, huashanSchoolDefenseGroup);
    assert.equal(condition.method, 'ordinary');
    assert.equal(p.action, 'ordinary');
    assert.equal(p.school_defense_prelude, 1);
    assert.ok([200, 400, 800].includes(p.level));
    assert.ok(['sword', 'blade', 'pin', 'none'].includes(p.attack_type));
    assert.equal(p.expected, 'observed');
    // Attacker weapon class is the condition's attack type.
    assert.equal(attacker.weapon, p.attack_type);
    if (p.attack_type === 'none') assert.ok(!attacker.weapon_details || !attacker.weapon_details.program);
    else assert.equal(attacker.weapon_details.program, '/tests/' + p.attack_type);
    // School defender keeps the original sword and mappings.
    assert.equal(defender.weapon, 'sword');
    assert.equal(defender.weapon_details.program, '/tests/sword');
    assert.deepEqual(defender.mappings, p.target.mappings);
    // Original powerup prelude on the defender before any combat.
    const step = raw.powerup;
    assert.ok(step, '须有原增益前置步骤');
    assert.equal(step.actor_side, 1, '原增益执行方为右方防守者');
    assert.equal(step.accepted, 1, '原增益前置受理');
    assert.equal(step.action, 'exert powerup');
    const buff = Math.floor(p.level / 3);
    for (const key of ['attack', 'defense'])
        assert.equal((step.after[1].temp.apply?.[key] ?? 0) - (step.before[1].temp.apply?.[key] ?? 0), buff,
            '原增益前置增量：' + key);
    assert.equal(step.after[1].temp.powerup, 1);
    assert.equal(step.before[1].neili - step.after[1].neili, 100, '原增益前置扣费100');
    // The prelude must not land on the attacker.
    assert.deepEqual(step.after[0].temp.apply ?? {}, step.before[0].temp.apply ?? {}, '前置不改进攻方属性');
    for (const state of [step.after[0], raw.immediate[0], raw.after[0]])
        assert.ok(!state.temp.powerup, '增益标记不得落在进攻方');
    // One original regular attack round; the only launch is the original powerup prelude.
    assert.equal(raw.launches.length, 1, '仅原增益前置一次发动');
    assert.equal(raw.launches[0].skill, 'zixia-shengong');
    assert.equal(raw.launches[0].argument, 'powerup');
    assert.ok(raw.attacks.some(a => a.actor === 0 && a.target === 1 && a.type === 0), '须经过原常规攻击轮');
    assert.equal(raw.interfaces.length, 0);
    // The original dodge pipeline resolves on the defender's school movement skill.
    assert.ok(raw.dodge_checks.length >= 2, '原轻功判定轨迹不得缺失');
    assert.deepEqual(raw.dodge_checks.slice(0, 2).map(c => c.phase), ['base', 'settled']);
    for (const check of raw.dodge_checks) {
        assert.equal(check.actor, 0);
        assert.equal(check.target, 1);
        assert.equal(check.type, 0);
        assert.equal(check.skill, 'huashan-shenfa', '原华山身法判定');
    }
    // The buff survives the round; expiry is covered by the recast window.
    for (const key of ['attack', 'defense'])
        assert.equal(raw.immediate[1].temp.apply?.[key] ?? 0, step.after[1].temp.apply?.[key] ?? 0,
            '轮次不得撤回原增益增量：' + key);
    assert.equal(raw.immediate[1].temp.powerup, 1);
    assert.equal(raw.after[1].temp.powerup, 1, '增益窗口未到期');
}
