// Assembled ordinary combat, not a clone of any teacher or equal-training-cost ranking.
import assert from 'node:assert/strict';
import { validateBoutRecord } from './bout_cases.mjs';
import { validateAttackRoundCounts, validateWudangPassiveRecord } from './school_wudang_passive_cases.mjs';

export function wudangBoutConditions(catalog, { smoke = false } = {}) {
    const sources = ['taiji-quan', 'wudang-zhang', 'taiji-jian', 'taiji-shengong', 'tiyunzong', 'taoism'];
    const paths = sources.map(id => {
        const source = catalog.skills.find(s => s.id === id);
        assert.ok(source, '缺少武当组合源码：' + id);
        return source.path;
    });
    const properties = { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000,
        qi: 10000, eff_qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0 };
    return ['taiji-quan', 'quan-zhang', 'taiji-jian'].flatMap(combination => [0, 50].map(jiali => {
        const armed = combination === 'taiji-jian', paired = combination === 'quan-zhang';
        const skill = armed ? 'taiji-jian' : 'taiji-quan', usage = armed ? 'sword' : 'unarmed';
        const skills = Object.fromEntries(['force', 'taiji-shengong', 'dodge', 'tiyunzong', 'parry',
            'taoism', 'unarmed', 'taiji-quan', ...(armed ? ['sword', 'taiji-jian'] : []),
            ...(paired ? ['strike', 'wudang-zhang'] : [])].map(id => [id, 400]));
        return { id: `school-wudang-bout-${combination}-l400-jiali${jiali}`, stage: 'school',
            entry_id: catalog.skills.find(s => s.id === skill).path, method: 'bout', samples: smoke ? 2 : 20,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-bout',
                combination, skill, usage, ability: 'bout', level: 400,
                observation: 'original_heartbeat_bout', strategy: 'ordinary', first: 'alternating_index',
                actor: { skills, mappings: { force: 'taiji-shengong', dodge: 'tiyunzong', parry: skill,
                    [usage]: skill, ...(paired ? { strike: 'wudang-zhang' } : {}) },
                    preparations: armed ? {} : { unarmed: 'taiji-quan', ...(paired ? { strike: 'wudang-zhang' } : {}) },
                    properties: { ...properties, jiali, 'family/family_name': '武当派' },
                    ...(armed ? { equipment: { type: 'sword', hold: false } } : {}) },
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 }, mappings: {},
                    preparations: {}, properties: { ...properties }, equipment: { type: 'sword', hold: false } },
                action: 'ordinary', fighting: true, observe_seconds: smoke ? 3 : 30,
                not_applicable: '', expected: 'observed',
                qualification_sources: [...paths, 'kungfu/class/wudang/zhang.c', 'feature/attack.c',
                    'feature/skill.c', 'feature/damage.c', 'inherit/char/char.c', 'inherit/skill/force.c',
                    'adm/daemons/combatd.c', 'include/combat.h', 'kungfu/skill/sword.c'],
                qualification_note: '400级实验组合，原USER心跳、自然恢复与30秒时钟，每条件20场交替先手；只普通交锋，不自动施展perform/exert。先天属性双方36，气血10000、内力6000、经验10000000；右方基本内功/闪躲/招架600、基本剑法200，无特殊映射，加力0；持剑均用伤害50的标准演武剑。左方基本与相关特殊武学400，映射太极神功/梯云纵；徒手映射太极拳招架，剑组映射太极剑招架。互备通过原prepare_skill设置，不冒充prepare命令或NPC原配置，也不代表可学性及同培养成本。combat_time从零由原attack累加，保持随机与原蓄力实参10/30；内力支出、自然恢复和净变化分别观察。',
            } };
    }));
}

export function validateWudangBoutRecord(raw, condition) {
    const p = condition.parameters, armed = p.combination === 'taiji-jian';
    assert.equal(raw.launches.length, 0, '普通策略不自动发动绝招');
    assert.equal(raw.interfaces.length, 0);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        assert.deepEqual(raw.before[side].preparations, config.preparations);
        assert.equal(raw.before[side].weapon, config.equipment?.type ?? 'none');
        for (const key of ['str', 'int', 'con', 'dex', 'combat_exp', 'qi', 'eff_qi', 'max_qi', 'neili', 'max_neili'])
            assert.equal(raw.before[side][key], config.properties[key], '初态不符：' + key);
        if (config.equipment) assert.equal(raw.before[side].weapon_damage, 50);
    }
    if (armed) {
        validateBoutRecord(raw, condition); validateAttackRoundCounts(raw);
        assert.equal(raw.taiji_events.length, 0, '持剑不冒充太极拳蓄力');
    } else validateWudangPassiveRecord(raw, condition);
    const forceCalls = raw.passives.filter(e => e.route === 'force');
    for (const e of forceCalls) {
        assert.equal(e.actor, 0); assert.equal(e.target, 1);
        assert.equal(e.skill, 'taiji-shengong'); assert.equal(e.factor, p.actor.properties.jiali);
    }
    if (!p.actor.properties.jiali) assert.equal(forceCalls.length, 0);
    // Equal experience, neutral opponent, and these skills have no other neili cost.
    // Recovery is accounted independently by the original heal_up observer.
    assert.equal(raw.metrics[0].neili_cost ?? 0, forceCalls.length * p.actor.properties.jiali);
    assert.equal(raw.metrics[1].neili_cost ?? 0, 0);
}
