// Original apprentice -> NPC -> recruit, with explicit experimental prerequisites.
// Teacher callbacks, pending intentions and successful family data are never stubbed.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

const names = 'bei dao daoming ding fang feng fengling guoxiang he hui ji jia kong li ling miejue su wenfang wenhui wenqing wenyin xian xin xu xuan zhao zhen zhou'.split(' ');
const common = ['cmds/skill/apprentice.c', 'cmds/skill/recruit.c', 'feature/apprentice.c',
    'feature/attribute.c', 'feature/dbase.c', 'feature/master.c', 'inherit/char/npc.c',
    'mudcore/inherit/dbase.c', 'adm/daemons/named.c', 'kungfu/class/emei/emei.h'];
export const emeiRecruitSources = [...common, ...names.map(n => `kungfu/class/emei/${n}.c`)];
const reviewed = '10b3cf230637044e55e1538a11a92c89709c952b2360b3012437a9c7923307d9';
const short = t => t.path.split('/').at(-1).slice(0, -2);
const flags = { have_letter: 0, apprentice_ok: 0, valid_in_fumoquan: 0 };
function category(name) {
    if (['dao', 'feng', 'guoxiang', 'ji'].includes(name)) return 'refusing';
    if (['daoming', 'wenfang', 'wenhui', 'wenqing', 'wenyin'].includes(name)) return 'no-hook';
    if (['fengling', 'miejue', 'zhou'].includes(name)) return name;
    if (['bei', 'ding', 'fang', 'li', 'ling', 'su'].includes(name)) return 'lay';
    return 'nun';
}

export function emeiRecruitConditions(relations, readSource) {
    const teachers = relations.objects.filter(t => t.group === 'emei');
    if (teachers.every(t => t.learning_permissions === undefined)) return [];
    assert.deepEqual(teachers.map(short).sort(), [...names].sort(), '峨嵋拜师NPC清单须重新核对');
    const evidence = [...emeiRecruitSources].sort().map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), reviewed,
        '峨嵋拜师源码变化，须重新核对');
    const result = [];
    for (const t of teachers) {
        const source = readSource(t.path), name = short(t), kind = category(name);
        const naming = t.names.find(n => n.function === 'create');
        const id = /^\(\{\s*"([^"]+)"/.exec(naming.args[1].raw)?.[1];
        const family = /create_family\("([^"]+)", (\d+), "([^"]+)"/.exec(source);
        assert.ok(id && family);
        const generation = Number(family[2]), teacherClass = /set\("class", "([^"]+)"/.exec(source)?.[1] ?? '';
        const setFamily = gen => ({ family_name: '峨嵋派', generation: gen,
            master_id: 'other master', master_name: '别位师父' });
        function add(variant, success, extra = {}) {
            const actor = { skills: { force: 180, dodge: 180, parry: 180,
                mahayana: 180, 'emei-xinfa': 180, 'linji-zhuang': 180, ...extra.skills }, mappings: {},
                properties: { name: '测试', gender: '女性', class: 'bonze', family: setFamily(generation + 1),
                    shen: 100000, str: 36, con: 40, dex: 36, int: 45, combat_exp: 1000000,
                    gongxian: 100, weiwang: 100, max_neili: 6000, neili: 6000,
                    jing: 10000, eff_jing: 10000, potential: 10000, learned_points: 0, ...extra.properties },
                ...(extra.busy ? { busy: extra.busy } : {}) };
            const props = actor.properties;
            const line = source.split('\n').findIndex(l => /^void create\(/.test(l)) + 1;
            const entry = { id: `${t.path}:${line}:create`, path: t.path, sha256: t.sha256,
                function: 'create', line, role: 'teaching' };
            const action = `apprentice ${id}`;
            const expected = { command_kind: 'apprentice', command_accepted: extra.accepted ?? 1,
                recruited: success, name_after: success && ['fengling', 'miejue'].includes(kind)
                    ? (kind === 'fengling' ? '灭' : '静') + props.name[1] : props.name,
                class_after: success && teacherClass && !['bonze', 'eunach'].includes(teacherClass)
                    && !['bonze', 'eunach'].includes(props.class) ? teacherClass : props.class,
                family_after: success ? { family_name: family[1], master_id: id, master_name: naming.values[0],
                    generation: generation + 1, title: '传人', privs: 0 } : props.family || {},
                flags_after: { ...flags }, pending_apprentice: !(success || extra.accepted === 0 || extra.foreign || extra.known),
                pending_betrayer: !!extra.foreign,
                contribution_spent: success && !props.family ? props.gongxian : 0 };
            const steps = [expected];
            if (extra.foreign) steps.push({ ...expected, pending_apprentice: true });
            if (extra.repeat) steps.push({ ...expected, recruited: false, command_accepted: success ? 1 : 0 });
            if (extra.cancel) steps.push({ ...expected, recruited: false, action: 'apprentice cancel',
                command_accepted: expected.pending_apprentice ? 1 : 0, pending_apprentice: false });
            result.push({ id: `teaching-emei-recruit-${name}-${variant}`, stage: 'school', method: 'teaching',
                entry_id: entry.id, samples: 2, status: 'configured_not_executed', parameters: {
                    teacher: { path: '/' + t.path.slice(0, -2), id, sha256: t.sha256 }, topic: '拜师',
                    teaching_profile: 'emei-recruit', teaching_kind: 'apprenticeship', action, actor,
                    target: { skills: {}, mappings: {}, properties: {} }, named_participants: true,
                    teaching_entry: entry, teaching_evidence: naming.evidence,
                    qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
                    fighting: false, observe_seconds: 0, not_applicable: '', monitored_grants: [],
                    teaching_expectations: steps, expected: success ? 'observed' : 'refused', variant,
                    recruit_category: kind, teacher_family: { family_name: family[1], generation }, known_issue: null,
                    note: '原拜师及收徒命令；初始门派、出家身份、技能、正气与经验均为显式实验输入，不证明自然养成或已剃度。不中途写入师承、意向或替换NPC回调；受理不等于收徒，四位拒收及五位无回调NPC同样采集。',
                } });
        }
        const enabled = !['refusing', 'no-hook'].includes(kind);
        add('baseline', enabled);
        add('repeat', enabled, { repeat: true });
        if (!enabled) { add('cancel', false, { cancel: true }); continue; }
        add('cancel-refusal', false, { properties: { shen: -1 }, cancel: true });
        for (const [variant, field] of [['detach', 'detach/峨嵋派'], ['betrayer', 'betrayer/峨嵋派'], ['betrayer-times', 'betrayer/times']])
            add(variant, false, { properties: { [field]: 1 } });
        for (const [variant, gender] of [['male', '男性'], ['sexless', '无性']]) add(variant, false, { properties: { gender } });
        add('negative-shen', false, { properties: { shen: -1 } });
        add('zero-shen', ['lay', 'zhou'].includes(kind), { properties: { shen: 0 } });
        add('foreign-family', false, { properties: { family: { ...setFamily(generation + 1), family_name: '武当派' } }, foreign: true });
        add('same-generation', false, { properties: { family: setFamily(generation) }, accepted: 0 });
        add('senior-generation', false, { properties: { family: setFamily(Math.max(0, generation - 1)) }, accepted: 0 });
        add('lay-disciple', teacherClass !== 'bonze', { properties: { class: '' } });
        add('no-family', true, { properties: { family: 0 } });
        add('no-family-lay', teacherClass !== 'bonze', { properties: { family: 0, class: '' } });
        add('existing-apprentice', false, { properties: { family: { ...setFamily(generation + 1),
            master_id: id, master_name: naming.values[0] } }, known: true });
        if (kind === 'nun') {
            add('shen999', false, { properties: { shen: 999 } });
            add('mahayana49', false, { skills: { mahayana: 49 } });
            add('exact-threshold', true, { properties: { shen: 1000 }, skills: { mahayana: 50 } });
        }
        if (['fengling', 'miejue'].includes(kind)) {
            const exp = kind === 'fengling' ? 500000 : 300000, level = kind === 'fengling' ? 150 : 100;
            const skill = kind === 'fengling' ? 'linji-zhuang' : 'emei-xinfa';
            add('shen29999', false, { properties: { shen: 29999 } });
            add('exp-low', false, { properties: { combat_exp: exp - 1 } });
            add('mahayana-low', false, { skills: { mahayana: level - 1 } });
            add('force-skill-low', false, { skills: { [skill]: level - 1 } });
            add('exact-threshold', true, { properties: { shen: 30000, combat_exp: exp }, skills: { mahayana: level, [skill]: level } });
        }
        if (kind === 'zhou') {
            add('int44', false, { properties: { int: 44 } });
            add('int45', true, { properties: { int: 45 } });
        }
        if (kind === 'lay') add('no-mahayana', true, { skills: { mahayana: 0 } });
        if (name === 'bei') add('busy', false, { busy: 5, accepted: 0 });
    }
    return result;
}
