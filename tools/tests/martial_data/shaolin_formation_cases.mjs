// Original Luohan inquiry, qualification and natural wait; not a victory test.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

export const formationMonks = {
    'xuan-ku': ['cheng-guan', 'cheng-zhi', 'cheng-ming', 'cheng-jing', 'cheng-jian', 'cheng-xing', 'cheng-ji', 'cheng-mie', 'cheng-he'],
    'xuan-nan': ['cheng-xin', 'cheng-yi', 'cheng-si', 'cheng-shi', 'cheng-zhi2', 'cheng-xin2', 'cheng-ling', 'cheng-yu', 'cheng-shang'],
};
export const shaolinFormationSources = [
    ...['xuan-ku', 'xuan-nan', ...Object.values(formationMonks).flat()].map(n => `kungfu/class/shaolin/${n}.c`),
    ...['xuan-ku', 'xuan-nan', 'xuan', 'cheng', 'shaolin'].map(n => `kungfu/class/shaolin/${n}.h`),
    ...['luohan', 'banruo'].flatMap(n => Array.from({ length: 9 }, (_, i) => `d/shaolin/${n}${i+1}.c`)),
    ...['wuchang', 'wuchang1', 'wuchang2'].map(n => `d/shaolin/${n}.c`),
    'cmds/std/ask.c', 'feature/command.c',
];
const reviewed = '178dcc0232c08f32a01d06daba165ab4447dd1f830ea3a231b73aa3632725afd';
const checks = ['finger', 'claw', 'hand', 'strike', 'cuff', 'dodge', 'parry', 'force'];

export function shaolinFormationConditions(relations, readSource) {
    if (relations.objects.every(t => t.learning_permissions === undefined)) return [];
    const evidence = [...shaolinFormationSources].sort().map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), reviewed,
        '少林罗汉阵源码变化，须重新核对');
    const out = [];
    for (const [name, monks] of Object.entries(formationMonks)) {
        const path = `kungfu/class/shaolin/${name}.c`, t = relations.objects.find(t => t.path === path);
        assert.ok(t, path);
        const ku = name === 'xuan-ku', header = `kungfu/class/shaolin/${name}.h`;
        const teacher = { path: '/' + path.slice(0,-2), id: ku ? 'xuanku dashi' : 'xuannan dashi',
            name: ku ? '玄苦大师' : '玄难大师', sha256: t.sha256 };
        const line = readSource(header).split('\n').findIndex(l => /^string ask_me\(/.test(l)) + 1;
        const entry = { id: `${header}:${line}:ask_me`, path: header, line, function: 'ask_me', role: 'teaching',
            sha256: evidence.find(e => e.path === header).sha256 };
        function add(id, allowed = true, properties = {}, skills = Object.fromEntries(checks.map(k => [k,80])), wait = 0) {
            const topic = id === 'alias' ? '罗汉大阵' : '十八罗汉阵';
            out.push({ id: `teaching-shaolin-formation-${wait ? 'wait' : 'gate'}-${name}-${id}`,
                stage: 'school', method: 'teaching', entry_id: entry.id, samples: wait ? 1 : 2,
                status: 'configured_not_executed', parameters: {
                    teacher, topic, teaching_profile: 'shaolin-formation', teaching_kind: 'formation_invitation',
                    action: `ask ${teacher.id} about ${topic}`, variant: id,
                    actor: { skills, mappings: {}, properties: {
                        name: '慧试', gender: '男性', class: 'bonze', title: '少林弟子',
                        family: { family_name: '少林派', generation: 38, master_id: 'other', master_name: '旧师父' },
                        guilty: 0, luohan_winner: 0, shen: 100000, gongxian: 100,
                        str: 30, con: 30, dex: 30, int: 30, combat_exp: 1000000,
                        neili: 6000, max_neili: 6000, jing: 10000, potential: 10000, learned_points: 0, ...properties,
                    } }, target: { skills: {}, mappings: {}, properties: {} }, named_participants: true,
                    teaching_entry: entry, teaching_evidence: entry,
                    qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
                    formation: { flag: ku ? 'xuanku-asked' : 'xuannan-asked',
                        field: '/d/shaolin/wuchang' + (ku ? '2' : '1'),
                        roster: monks.map(n => '/kungfu/class/shaolin/' + n) },
                    fighting: false, observe_seconds: wait, not_applicable: '', monitored_grants: [],
                    teaching_expectations: [{ command_kind: 'ask', allowed }], expected: allowed ? 'observed' : 'refused',
                    ...(wait ? { known_issue: 'MA-103' } : {}),
                    note: '原ask召集九名罗汉，学生留在隔离起点；不注入过阵/询问标记，不召集另一侧、不跳时钟。获召集不等于战斗或胜利；等待组保留原回调。',
                } });
        }
        add('level80'); add('alias'); add('level81', true, {}, Object.fromEntries(checks.map(k => [k,81])));
        add('no-skills', false, {}, {}); add('one-skill', false, {}, { force: 80 });
        add('two-unchecked-skills', true, {}, { literate: 1, buddhism: 1 });
        for (const g of [36,37,39]) add('generation' + g, g <= 38,
            { family: { family_name: '少林派', generation: g, master_id: 'other', master_name: '旧师父' } });
        add('foreign', true, { family: { family_name: '武当派', generation: 99 } });
        add('no-family', true, { family: 0 });
        add('already-winner', false, { luohan_winner: 1 });
        add('guilty', false, { guilty: 1 }); add('negative-guilty', true, { guilty: -1 });
        for (const skill of checks) {
            const base = Object.fromEntries(checks.map(k => [k,80]));
            add(skill + '-79', false, {}, { ...base, [skill]: 79 });
            delete base[skill]; add(skill + '-missing', true, {}, base);
        }
        add('absent-challenger', true, {}, undefined, 306);
    }
    return out;
}
