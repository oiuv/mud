// Observe original improve_skill -> skill_improved, not direct callback calls.
import assert from 'node:assert/strict';
import { learnedGain } from './school_huashan_learning_cases.mjs';

export function huashanUpgradeConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const source = catalog.skills.find(s => s.id === 'dugu-jiujian');
    assert.ok(source);
    const result = [];
    function add(level, suffix, { qi = 0, po = 0, nothing = false, cycles = 1, action = 'improve', checks } = {}) {
        result.push({ id: `school-huashan-upgrade-l${level}-${suffix}`, stage: 'school',
            entry_id: source.path, method: 'upgrade', samples: smoke ? 2 : checks ?? (nothing ? 2 : samples),
            parameters: { school: 'huashan', family: '华山派', collection_group: 'huashan-upgrade',
                combination: nothing ? 'nothing' : 'normal', skill: 'dugu-jiujian', usage: 'sword',
                ability: 'skill_improved', level, observation: 'single_action_immediate',
                actor: { skills: { sword: Math.max(200, level + 2), parry: level,
                    'dugu-jiujian': level, 'martial-cognize': level },
                    mappings: { sword: 'dugu-jiujian', parry: 'dugu-jiujian' },
                    properties: { jiali: 0, neili: 6000, max_neili: 6000, jing: 10000,
                        int: 39, con: 36, dex: 36, character: '狡黠多变', combat_exp: 1000000000,
                        potential: 10000, learned_points: 0, 'family/family_name': '华山派',
                        'can_learn/dugu-jiujian/nothing': nothing ? 1 : 0,
                        'can_perform/dugu/qi': qi, 'can_perform/dugu/po': po },
                    equipment: { type: 'sword', hold: false } },
                target: { skills: {}, mappings: {}, properties: {} }, action, cycles,
                primer: { skill: 'dugu-jiujian', amount: 10000000, weak_mode: 1 },
                fighting: false, observe_seconds: 0, not_applicable: '', expected: 'observed',
                qualification_sources: ['kungfu/skill/dugu-jiujian.c', 'kungfu/skill/dugu-jiujian/jue.c',
                    'kungfu/skill/martial-cognize.c', 'feature/skill.c', 'cmds/skill/perform.c'],
                qualification_note: '真实非巫师USER；每步经原improve_skill的weak_mode预置超阈值进度并保留快照，再以原API或总诀式升级；不是普通单次修炼收益或取得这些资格的教学证明。',
            } });
    }
    for (const level of [119, 120, 149, 150, 200, 400, 800]) for (const nothing of [false, true])
        add(level, nothing ? 'nothing' : 'normal', { nothing });
    for (const grant of ['qi', 'po']) for (const progress of [99, 100, 101]) for (const nothing of [false, true])
        add(200, `${grant}${progress}${nothing ? '-nothing' : ''}`, {
            qi: 101, po: 101, [grant]: progress, nothing, cycles: progress < 101 ? 2 : 1,
            ...(progress === 101 ? { checks: 2 } : {}),
        });
    for (const level of [120, 150, 200]) add(level, 'jue', { qi: 100, po: 100, action: 'perform sword.jue' });
    for (const nothing of [false, true]) add(200, `weak${nothing ? '-nothing' : ''}`,
        { qi: 100, po: 100, action: 'weak', cycles: 2, nothing, checks: 2 });
    return result;
}

export function cognitionReward(level, progress, calls) {
    for (let i = 0; i < calls; i++) {
        progress += 1 + Math.trunc(150000000 / (level + 100));
        if (progress > (level + 1) ** 2) { level++; progress = 0; }
    }
    return { level, progress };
}

export function rewardBranches(step) {
    return ['qi', 'po'].filter(grant => step.after.skills['dugu-jiujian'] > step.primed.skills['dugu-jiujian']
        && !step.primed.nothing && step.after.skills['dugu-jiujian'] > (grant === 'qi' ? 120 : 150)
        && step.primed.dugu_grants[grant] <= 100 && step.after.dugu_grants[grant] >= 100);
}

export function validateHuashanUpgradeRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(raw.before[0].nothing, p.actor.properties['can_learn/dugu-jiujian/nothing']);
    for (const grant of ['qi', 'po'])
        assert.equal(raw.before[0].dugu_grants[grant], p.actor.properties[`can_perform/dugu/${grant}`]);
    assert.equal(raw.upgrades.length, p.cycles);
    let previous = raw.before[0];
    for (const step of raw.upgrades) {
        assert.deepEqual(step.before, previous);
        const { before, primed, after } = step;
        const level = before.skills['dugu-jiujian'], cognition = before.skills['martial-cognize'];
        const prepared = structuredClone(before);
        prepared.learned['dugu-jiujian'] = (before.learned['dugu-jiujian'] ?? 0)
            + learnedGain(p.primer.amount, level, cognition);
        assert.deepEqual(primed, prepared, '预置进度不得升级、增加领悟或修改资源');
        assert.ok(primed.learned['dugu-jiujian'] > (level + 1) ** 2);
        assert.equal(step.action, p.action);
        assert.equal(after.skills['dugu-jiujian'], level + (p.action === 'weak' ? 0 : 1));
        for (const grant of ['qi', 'po']) {
            const eligible = p.action !== 'weak' && !before.nothing && after.skills['dugu-jiujian'] > (grant === 'qi' ? 120 : 150)
                && before.dugu_grants[grant] <= 100;
            const delta = after.dugu_grants[grant] - before.dugu_grants[grant];
            assert.ok(eligible ? Number.isInteger(delta) && delta >= 0 && delta < Math.trunc(before.int / 3) : delta === 0);
        }
        const reward = cognitionReward(cognition, before.learned['martial-cognize'] ?? 0, rewardBranches(step).length * 3);
        assert.equal(after.skills['martial-cognize'], reward.level);
        assert.equal(after.learned['martial-cognize'] ?? 0, reward.progress);
        for (const key of ['nothing', 'potential', 'learned_points', 'mappings', 'conditions'])
            assert.deepEqual(after[key], before[key]);
        if (p.action === 'perform sword.jue') {
            assert.equal(step.accepted, 1);
            assert.ok(before.neili - after.neili >= 50 && before.neili - after.neili <= 79);
            assert.equal(before.jing - after.jing, 41);
            assert.equal(after.skills.sword, before.skills.sword);
            const gain = after.learned.sword - (before.learned.sword ?? 0);
            assert.ok(gain >= learnedGain(10, before.skills.sword, cognition)
                && gain <= learnedGain(29, before.skills.sword, cognition));
            assert.ok([0, learnedGain(1, level + 1, reward.level)].includes(after.learned['dugu-jiujian']));
        } else {
            assert.equal(after.learned['dugu-jiujian'], p.action === 'weak' ? primed.learned['dugu-jiujian'] + 1 : 0);
            assert.equal(after.neili, before.neili); assert.equal(after.jing, before.jing);
            assert.equal(after.skills.sword, before.skills.sword);
            assert.equal(after.learned.sword ?? 0, before.learned.sword ?? 0);
        }
        previous = after;
    }
    assert.deepEqual(raw.immediate[0], previous);
    assert.deepEqual(raw.immediate[1], raw.before[1]);
    assert.equal(raw.launches.length, p.action === 'perform sword.jue' ? 1 : 0);
}
