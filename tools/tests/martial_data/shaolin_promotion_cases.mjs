// Original ask -> give -> fight/timer -> give -> apprentice, not manufactured letters.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

const names = ['qing-le', 'qing-shan', 'dao-jue', 'hui-xiu', 'cheng-guan', 'xuan-ci'];
export const shaolinPromotionSources = [
    ...names.map(n => `kungfu/class/shaolin/${n}.c`),
    ...['shaolin', 'qing', 'dao', 'hui', 'cheng', 'xuan'].map(n => `kungfu/class/shaolin/${n}.h`),
    ...['damo-ling', 'tuijianxin-1', 'tuijianxin-2', 'tuijianxin-3', 'tuijianxin-4'].map(n => `d/shaolin/obj/${n}.c`),
    'cmds/std/ask.c', 'cmds/std/give.c', 'cmds/std/fight.c', 'cmds/skill/apprentice.c',
    'cmds/skill/recruit.c', 'feature/apprentice.c', 'feature/master.c', 'feature/attack.c',
    'inherit/char/npc.c', 'adm/daemons/combatd.c',
];
const reviewed = '58f2cb635f510b45b7257318dffd60a968455e450c8e851ec2b8304aa5a52cf2';
const checkedSkills = ['buddhism', 'dodge', 'shaolin-shenfa', 'force', 'parry'];

export function shaolinPromotionConditions(relations, readSource) {
    if (relations.objects.every(t => t.learning_permissions === undefined)) return [];
    const evidence = [...shaolinPromotionSources].sort().map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), reviewed,
        '少林推荐信源码变化，须重新核对');
    const teachers = names.map(name => {
        const path = `kungfu/class/shaolin/${name}.c`, t = relations.objects.find(t => t.path === path);
        assert.ok(t, path);
        const source = readSource(path), naming = t.names.find(n => n.function === 'create');
        return { path: '/' + path.slice(0, -2), id: /^\(\{\s*"([^"]+)"/.exec(naming.args[1].raw)[1],
            name: naming.values[0], sha256: t.sha256,
            generation: Number(/create_family\("少林派", (\d+)/.exec(source)[1]) };
    });
    const issuer = teachers[0], result = [];
    function actor(generation, level, overrides = {}) {
        return { skills: Object.fromEntries(checkedSkills.map(k => [k, level])), mappings: {},
            properties: { name: '虚试', gender: '男性', class: 'bonze',
                family: { family_name: '少林派', generation, master_id: 'other master', master_name: '旧师父' },
                shen: 100000, gongxian: 100, str: 36, con: 40, dex: 36, int: 35,
                combat_exp: 1000000, max_neili: 6000, neili: 6000,
                jing: 10000, potential: 10000, learned_points: 0, ...overrides } };
    }
    function step(teacher, action, state = {}) {
        return { teacher, action, command_kind: action.split(' ')[0], command_accepted: 1,
            tokens: 0, letter: 0, fight_ok: 0, have_letter: 0, apprentice_ok: 0,
            ...state };
    }
    const ask = state => step(issuer, `ask ${issuer.id} about 达摩令`, state);
    function add(id, student, steps) {
        const t = steps[0].teacher;
        const source = readSource(t.path.slice(1) + '.c');
        const line = source.split('\n').findIndex(l => /^void create\(/.test(l)) + 1;
        const entry = { id: `${t.path.slice(1)}.c:${line}:create`, path: t.path.slice(1) + '.c',
            function: 'create', line, role: 'teaching', sha256: t.sha256 };
        result.push({ id: `teaching-shaolin-promotion-${id}`, stage: 'school', method: 'teaching',
            entry_id: entry.id, samples: 2, status: 'configured_not_executed', parameters: {
                teacher: t, topic: '达摩令与推荐信', teaching_profile: 'shaolin-promotion',
                teaching_kind: 'promotion_quest', action: steps[0].action,
                actor: student, target: { skills: {}, mappings: {}, properties: {} }, named_participants: true,
                teaching_entry: entry, teaching_evidence: entry,
                qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
                fighting: false, observe_seconds: 90, not_applicable: '', monitored_grants: [],
                teaching_expectations: steps, expected: steps.some(e => e.tokens || e.letter || e.recruited) ? 'observed' : 'refused',
                variant: id, note: '已有辈分与基本功为实验初态。令牌、推荐信、切磋许可和晋升均来自原命令；不改NPC血量，不注入信物，不替换回调或时钟。高等级切磋只核验流程，不作门槛胜率。',
            } });
    }
    for (let generation = 36; generation <= 41; generation++) {
        const level = (41 - generation) * 20 + 30;
        add(`token-gen${generation}`, actor(generation, level), [ask({ tokens: 1 })]);
        for (const skill of checkedSkills) {
            const a = actor(generation, level); a.skills[skill]--;
            add(`token-gen${generation}-${skill}-low`, a, [ask({})]);
        }
    }
    for (const [id, family] of [['no-family', 0], ['foreign', { family_name: '武当派', generation: 41 }]])
        add('token-' + id, actor(41, 600, { family }), [ask({})]);
    add('token-repeat', actor(41, 30), [ask({ tokens: 1 }), ask({ tokens: 2 })]);
    for (let n = 1; n <= 4; n++) {
        const challenger = teachers[n], next = teachers[n + 1], generation = challenger.generation + 1;
        const a = actor(generation, 600);
        a.skills.unarmed = 600; a.skills['shaolin-xinfa'] = 600;
        a.mappings = { force: 'shaolin-xinfa', dodge: 'shaolin-shenfa' };
        a.properties.combat_exp = 100000000;
        const give = step(challenger, `give damo ling to ${challenger.id}`, { fight_ok: 1 });
        add(`stage${n}-token`, a, [ask({ tokens: 1 }), give]);
        add(`stage${n}-wrong-generation`, { ...a, properties: { ...a.properties,
            family: { ...a.properties.family, generation: generation + 1 } } },
        [ask({ tokens: 1 }), { ...give, tokens: 1, fight_ok: 0 }]);
        add(`stage${n}-no-permission`, a, [step(challenger, `fight ${challenger.id}`, { command_accepted: 0 })]);
        add(`stage${n}-complete`, a, [ask({ tokens: 1 }), give,
            step(challenger, `fight ${challenger.id}`, { wait_fight: true, letter: n, have_letter: 1 }),
            step(next, `give tuijian xin${n} to ${next.id}`, { have_letter: 1, apprentice_ok: 1 }),
            step(next, `apprentice ${next.id}`, { recruited: true, generation: generation - 1,
                name: ['清', '道', '慧', '澄'][n - 1] + '试' })]);
    }
    return result;
}
