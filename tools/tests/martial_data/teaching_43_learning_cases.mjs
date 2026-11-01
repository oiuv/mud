// Reviewed repairs for the 22 malformed recognize_apprentice probes.
// These are ordinary learn-command experiments, not natural apprenticeship claims.
import assert from 'node:assert/strict';
import { scanSource, sha256 } from './inventory.mjs';

export const teaching43LearningGroup = 'teaching-43-learning';
const definitions = [
    ['riyue/dongfang/dongfang', 'dongfang bubai', 'pixie-jian', '日月神教', '', 'd9ba06f99b73807fd37f6597f9f9ec47a4f3d334bd3ec07e04b977d8498af6b2'],
    ['riyue/fan', 'fan song', 'axe', '日月神教', 'ren woxing', 'a3020f764ab67c66fa5858a6665748dabe75bf5a234e3004165eb1274414dc05'],
    ['riyue/feng', 'zhang chengfeng', 'club', '日月神教', 'ren woxing', '9373429b896a6a6376845636d1026b72546f32d1e0e1c0edd03328caae946be9'],
    ['riyue/yun', 'zhang chengyun', 'club', '日月神教', 'ren woxing', '61c46f8ef0fb5449e17d937569c1c27adc49e75f12e661548092b8ac4b0a7b01'],
    ['riyue/zhao', 'zhao he', 'hammer', '日月神教', 'ren woxing', '0531e31e7c0a95dfcfbb7be4eb61fdfdfd6d7a468afe574d0c54de4e55939987'],
    ['lingjiu/duanmu', 'duanmu yuan', 'unarmed', '灵鹫宫', 'xuzhu zi', '83e7a4b38e69bfe1084ed8fc888b59e6d0ad3c862312613ac2e2c74b12157e60'],
    ['lingjiu/li', 'li furen', 'club', '灵鹫宫', 'xuzhu zi', '10498937dbc7d852f8abc00a5dc8e6870553efd3e6009863e90be39cc520eba9'],
    ['lingjiu/sang', 'sang tugong', 'throwing', '灵鹫宫', 'xuzhu zi', '9dbe09e7514fad1a02d54853939778897fe8e54af365ece17a6ddaa861070868'],
    ['lingjiu/zhuo', 'zhuo bufan', 'sword', '灵鹫宫', 'xuzhu zi', '711d54cbcc62708b2e97a206077011c72f3125545134421ab060c7edadb53f3a'],
    ['lingjiu/zuo', 'zuo zimu', 'sword', '灵鹫宫', 'xuzhu zi', 'bcf89bb12585e7d8609576f16f859985eca1b361dc46f2601b0df1503062af10'],
    ['huashan/linghu', 'linghu chong', 'tanqin-jifa', '', '', '9c4ac4b24d8f287fef2da2960d274f6ee57258dd4176e25e37b40e638b32415a'],
    ['duan/gu', 'gu ducheng', 'axe', '段氏皇族', '', 'c710f4d492b7f6c5350064e15154eed39c01ca8cd1fd40dc14da218fbb8fd349'],
    ['duan/hua', 'hua hegen', 'claw', '段氏皇族', '', '065684111a119365b2431031fa380127852a77494dcf469189949394c8bf4cd5'],
    ['duan/yideng', 'yideng dashi', 'buddhism', '', '', '05a38e2cbceaaf88b7e60e8503c652fa1ac3cf166ed1ca4940374741c1a25458'],
    ['duan/zhu', 'zhu danchen', 'dagger', '段氏皇族', '', '50576df6ffa3103da2ef8363ab02a8846b1d99d9403d214110c093f62348bcd4'],
    ['honghua/lu', 'lu feiqing', 'sword', '红花会', 'chen jialuo', 'eef23f78aaa3a666f509dd105f713945a0313365edf31fa7e0d1c6849bd1b198'],
    ['gaibang/ada', 'a da', 'sword', '丐帮', 'ma dayuan', 'b9cb3ce5997d50424abfb01370c0e14a01b1608a5bd24d9e3e53992110f6a63f'],
    ['lingxiao/shiqing', 'shi qing', 'sword', '凌霄城', 'bai zizai', '8e08f2811bde0beffe97cdb8ff8adfe27c9d230e37625624eaba36d80cd2e280'],
    ['hu/cheng', 'cheng lingsu', 'medical', '关外胡家', '', '849a19884238854cf50afb5665ee5eb45a23a95f06906b4574e502fe66dd488d'],
    ['ouyang/ouyangfeng', 'ouyang feng', 'guzheng-jifa', '', '', '8a049f7c31f5cdd612dd90f9e9e187e3eeb23e6563be841abb4c694def14427b'],
    ['ouyang/ouyangke', 'ouyang ke', 'lingshe-quan', '', '', '9363dbc2dd7fe9df78672d71287ece800a0ad39d3b1204561cedbe209359237b'],
    ['tianlongsi/kurong', 'kurong', 'buddhism', '', '', '381f518a1d4882e4142970fbd48adbe2f0b68486bdf713b59541ef2db4d8bae1'],
];

export const teaching43Teachers = definitions.map(([key, id, skill, family, master, hash]) =>
    ({ key, id, skill, family, master, path: `kungfu/class/${key}.c`, sha256: hash }));

export function teaching43LearningConditions(relations, catalog, readSource) {
    return teaching43Teachers.map(def => {
        const source = readSource(def.path), scan = scanSource(source);
        assert.equal(sha256(source), def.sha256, `re-review changed teacher: ${def.path}`);
        const teacher = relations.objects.find(t => t.path === def.path);
        const gate = teacher?.gates.find(g => g.function === 'recognize_apprentice');
        assert.ok(gate && gate.evidence.sha256 === def.sha256, 'reviewed recognition gate missing');
        const declaration = scan.calls.find(c => c.function === 'create' && c.name === 'set_skill'
            && c.args[0]?.value === def.skill);
        assert.ok(declaration && /^\d+$/.test(declaration.args[1].raw), 'exact teacher skill level missing');
        const skillSource = catalog.skills.find(s => s.path === `kungfu/skill/${def.skill}.c`
            || s.path === `kungfu/skill/${def.skill}.lpc`);
        assert.ok(skillSource, 'reviewed learn skill source missing');
        const properties = {
            gender: '男性', character: '心狠手辣', str: 32, con: 30, int: 34, dex: 32,
            shen: def.key.startsWith('riyue/') ? -80000 : 50000,
            combat_exp: 1000000, potential: 10000, learned_points: 0, gongxian: 0,
            qi: 10000, eff_qi: 10000, max_qi: 10000,
            jing: 10000, eff_jing: 10000, max_jing: 10000,
            neili: 6000, max_neili: 6000, jingli: 1000, max_jingli: 1000,
        };
        if (def.family) properties.family = { family_name: def.family, generation: 20,
            master_id: def.master, master_name: def.key === 'lingxiao/shiqing' ? '白自在' : '' };
        if (def.key === 'riyue/dongfang/dongfang') properties.gender = '无性';
        // This is a reviewed prerequisite input, not claimed acquisition of the permission.
        if (def.key === 'ouyang/ouyangke') properties['can_learn/lingshe-quan/ke'] = 1;
        const path = '/' + def.path.slice(0, -2);
        const entry = { id: `${def.path}:${gate.evidence.line}:recognize_apprentice`,
            path: def.path, sha256: def.sha256, function: 'recognize_apprentice',
            role: 'teaching', line: gate.evidence.line };
        const action = `learn ${def.id} ${def.skill} 1`;
        const qualification_sources = [def.path, skillSource.path, 'kungfu/skill/literate.c',
            'cmds/skill/learn.c', 'feature/apprentice.c', 'feature/skill.c'];
        return { id: 'teaching-43-learn-' + def.key.replaceAll('/', '-'), stage: 'school',
            method: 'teaching', entry_id: entry.id, samples: 100, status: 'configured_not_executed',
            parameters: { collection_group: teaching43LearningGroup, teaching_profile: teaching43LearningGroup,
                teaching_kind: 'ordinary_learning', teacher: { path, id: def.id, sha256: def.sha256 },
                teacher_level: Number(declaration.args[1].raw), skill: def.skill,
                teaching_entry: entry, teaching_evidence: gate.evidence,
                action, teaching_expectations: [{ action, command_kind: 'learn' }],
                monitored_grants: [], actor: { skills: { force: 200, dodge: 100, parry: 100,
                    sword: 100, unarmed: 100, ...(def.skill === 'lingshe-quan' ? { cuff: 100 } : {}),
                    [def.skill]: 50 }, mappings: {}, preparations: {}, properties },
                target: { skills: {}, mappings: {}, properties: {} }, named_participants: true,
                fighting: false, observe_seconds: 0, expected: 'observed', not_applicable: '',
                qualification_sources, qualification_evidence: qualification_sources.map(path =>
                    ({ path, sha256: sha256(readSource(path)) })),
                note: '非本师学习：经原 recognize_apprentice 与 learn，验证真实进度、潜能和精神。'
                    + '门派、原师与资格为实验输入，不声称自然拜师、完整养成或许可取得。' } };
    });
}

export function validateTeaching43LearningRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, teaching43LearningGroup);
    assert.equal(p.teaching_profile, teaching43LearningGroup);
    const def = teaching43Teachers.find(d => '/' + d.path.slice(0, -2) === p.teacher.path);
    assert.ok(def, 'unreviewed recognition teacher');
    assert.equal(p.teacher.sha256, def.sha256);
    assert.equal(p.teaching_entry.path, def.path);
    assert.equal(p.teaching_entry.sha256, def.sha256);
    assert.equal(p.teaching_entry.function, 'recognize_apprentice');
    assert.equal(p.skill, def.skill);
    assert.equal(p.teacher.id, def.id);
    const action = `learn ${def.id} ${def.skill} 1`;
    assert.equal(p.action, action, 'recognition requires a complete real learn command');
    assert.equal(condition.method, 'teaching');
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, condition.method);
    assert.equal(raw.outcome, 'observed');
    assert.equal(raw.teaching?.length, 1, 'exactly one original lesson');
    const step = raw.teaching[0];
    assert.equal(step.command, action);
    assert.equal(step.teacher_program, p.teacher.path);
    assert.match(step.teacher.slice(p.teacher.path.length), /^#\d+$/, 'original teacher clone');
    assert.equal(step.teacher.slice(0, p.teacher.path.length), p.teacher.path);
    assert.equal(step.student, raw.before?.[0]?.object);
    assert.equal(step.student, raw.after?.[0]?.object);
    assert.equal(step.command_accepted, 1);
    assert.equal(step.teacher_skills?.[p.skill], p.teacher_level);
    assert.equal(step.teacher_no_teach?.kind, 'none', 'ordinary recognize route, no alternate no_teach callback');
    const before = step.before, after = step.after;
    const props = p.actor.properties;
    assert.notEqual(before.master_id, p.teacher.id, 'own apprentice would skip recognize_apprentice');
    assert.equal(before.master_id || '', props.family?.master_id ?? '');
    assert.equal(before.family || '', props.family?.family_name ?? '');
    assert.equal(after.master_id, before.master_id);
    assert.equal(after.family, before.family);
    for (const field of ['skills', 'learned', 'mappings', 'jing', 'neili', 'max_neili',
        'str', 'dex', 'con', 'int', 'combat_exp', 'shen', 'potential', 'learned_points']) {
        assert.deepEqual(before[field], raw.before[0][field], 'before sample/lesson mismatch: ' + field);
        assert.deepEqual(after[field], raw.after[0][field], 'after sample/lesson mismatch: ' + field);
    }
    for (const field of ['str', 'dex', 'con', 'int', 'combat_exp', 'shen', 'max_neili', 'potential']) {
        assert.equal(before[field], props[field], 'reviewed qualification input: ' + field);
        assert.equal(after[field], before[field], 'qualification changed during lesson: ' + field);
    }
    assert.equal(before.character, props.character);
    assert.equal(after.character, before.character);
    assert.equal(before.contribution, props.gongxian);
    assert.equal(raw.before[0].gender, props.gender);
    assert.equal(raw.after[0].gender, raw.before[0].gender);
    assert.deepEqual(before.skills, p.actor.skills, 'exact reviewed initial skill levels');
    assert.deepEqual(before.mappings, p.actor.mappings);
    assert.equal(before.skills[p.skill], 50);
    assert.equal(after.skills[p.skill], 50, 'one lesson cannot level this prepared skill');
    const amount = (after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0);
    const rand = Math.trunc((before.effective_int + Math.trunc(50 / 5)) / 2);
    assert.equal(before.int, props.int);
    assert.equal(before.effective_int, props.int, 'no hidden literacy or attribute bonus');
    // F_SKILL::improve_skill applies its level-dependent conversion after learn's random roll.
    const minimum = 1 + Math.trunc(4 * 100 / (50 + 100));
    const maximum = 1 + Math.trunc((4 + rand - 1) * 100 / (50 + 100));
    assert.ok(Number.isSafeInteger(amount) && amount >= minimum && amount <= maximum,
        'actual learn random proficiency range');
    assert.equal(before.jing, props.jing);
    assert.equal(before.jing - after.jing, Math.trunc((100 + 50 * 2) / props.int));
    assert.equal(before.learned_points, props.learned_points);
    assert.equal(after.learned_points - before.learned_points, 1);
    assert.equal(after.potential, before.potential);
    assert.equal(after.neili, before.neili);
    assert.equal(after.contribution, before.contribution);
    for (const key of new Set([...Object.keys(before.skills), ...Object.keys(after.skills)]))
        assert.equal(after.skills[key], before.skills[key], 'other skill level changed');
    for (const key of new Set([...Object.keys(before.learned), ...Object.keys(after.learned)]))
        if (key !== p.skill) assert.equal(after.learned[key] ?? 0, before.learned[key] ?? 0);
    return [{ advanced: true, skill_advanced: true, acquired: false, command_kind: 'learn',
        proficiency: amount, learned_points_spent: 1, contribution_spent: 0,
        jing_spent: before.jing - after.jing }];
}
