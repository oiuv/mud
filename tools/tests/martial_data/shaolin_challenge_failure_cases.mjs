// Low-health admission followed by original combat and retreat callbacks.
import { shaolinChallengeConditions } from './shaolin_challenge_cases.mjs';

export function shaolinChallengeFailureConditions(relations, readSource) {
    return shaolinChallengeConditions(relations, readSource).map(original => {
        const c = structuredClone(original), p = c.parameters;
        c.id = c.id.replace('challenge-', 'challenge-failure-');
        c.samples = 2;
        p.challenge_scenario = 'low-health';
        p.variant = 'low-health-' + p.variant;
        p.observe_seconds = 30;
        // Dehydration is a documented initial resource condition: original
        // heal_up returns before healing, without freezing or replacing it.
        Object.assign(p.actor.properties, { max_qi: 10000, eff_qi: 1, qi: 1, water: 0 });
        p.note = '两位原主持、原go命令和真实失败回调；气血/有效气血1、最大气血10000、饮水0为实验初态。原心跳、恢复、伤害和死亡处理不替换，不注入阵法状态，不代表正常玩家失败率。';
        return c;
    });
}
