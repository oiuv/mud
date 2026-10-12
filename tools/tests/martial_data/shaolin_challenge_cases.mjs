// Actual dual invitation, walking and unaccelerated Luohan callbacks.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { shaolinFormationConditions, shaolinFormationSources, formationMonks } from './shaolin_formation_cases.mjs';

export const shaolinChallengeSources = [...shaolinFormationSources,
    'd/shaolin/houdian.c', 'cmds/std/go.c'];

export function shaolinChallengeConditions(relations, readSource) {
    const base = shaolinFormationConditions(relations, readSource);
    if (!base.length) return [];
    const evidence = [...shaolinChallengeSources].sort().map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), 'e8dac219630c965097a6acb043d54603d9fb4ee16d1f0a40493c42b6271aae78',
        '罗汉阵完整挑战源码变化，须重新核对');
    const out = [];
    for (const first of ['xuan-ku', 'xuan-nan']) for (const foreign of [false, true]) {
        const order = [first, first === 'xuan-ku' ? 'xuan-nan' : 'xuan-ku'];
        const invitations = order.map(n => base.find(c => c.id === `teaching-shaolin-formation-gate-${n}-level80`));
        const c = structuredClone(invitations[0]), p = c.parameters;
        c.id = `teaching-shaolin-challenge-${first}-${foreign ? 'foreign' : 'shaolin'}`;
        c.samples = foreign ? 1 : 2;
        Object.assign(p, { teaching_profile: 'shaolin-challenge', teaching_kind: 'formation_challenge',
            qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
            variant: `${first}-${foreign ? 'foreign' : 'shaolin'}`, observe_seconds: foreign ? 50 : 80,
            challenge_order: order,
            challenge_rosters: Object.fromEntries(Object.entries(formationMonks).map(([k,v]) =>
                [k, v.map(n => '/kungfu/class/shaolin/' + n)])),
            teaching_expectations: invitations.map(c => ({ command_kind: 'ask', allowed: true,
                teacher: c.parameters.teacher, action: c.parameters.action, formation: c.parameters.formation })),
            note: '两位原主持、原go命令和真实回调；80级基本功，高气血仅用于观察完整流程，不代表门槛胜率。保持原心跳恢复，不注入过阵标记、不加速、不手动调用主持函数。',
        });
        delete p.formation;
        Object.assign(p.actor.properties, { max_qi: 1000000, eff_qi: 1000000, qi: 1000000 });
        if (foreign) p.actor.properties.family = { family_name: '武当派', generation: 99 };
        out.push(c);
    }
    return out;
}
