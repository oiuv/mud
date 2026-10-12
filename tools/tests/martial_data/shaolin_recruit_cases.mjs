// Original apprentice -> NPC -> recruit. Prerequisite generations/flags are
// explicit experimental inputs, never proof of completing the promotion quest.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

const common = ['cmds/skill/apprentice.c', 'cmds/skill/recruit.c', 'feature/apprentice.c',
    'feature/attribute.c', 'feature/dbase.c', 'feature/master.c', 'inherit/char/npc.c',
    'mudcore/inherit/dbase.c', 'adm/daemons/named.c',
    ...'shaolin cheng dao hui qing xuan du xuan-ku xuan-nan'.split(' ').map(n => `kungfu/class/shaolin/${n}.h`)];
const names = ('cheng-guan cheng-he cheng-ji cheng-jian cheng-jing cheng-ling cheng-mie cheng-ming '
    + 'cheng-shang cheng-shi cheng-si cheng-xin cheng-xin2 cheng-xing cheng-yi cheng-yu cheng-zhi cheng-zhi2 '
    + 'da-mo dao-chen dao-cheng dao-guo dao-jue dao-pin dao-xiang dao-xiang2 dao-yi dao-zheng '
    + 'du-e du-jie du-nan du-yuan hui-he hui-jie hui-kong hui-ming hui-ru hui-se hui-xiu hui-xu hui-zhen '
    + 'jue-yuan kong-jian qing-fa qing-guan qing-le qing-shan qing-wei qing-wen qing-wu qing-xiao qing-yuan '
    + 'tuoboseng wuming xingzhe xu-ming xu-tong xuan-bei xuan-ci xuan-ji xuan-ku xuan-nan xuan-tong').split(' ');
export const shaolinRecruitSources = [...common, ...names.map(n => `kungfu/class/shaolin/${n}.c`)];
const reviewed = '1e41f6c8bc1ebcfb79a676c692b41d10e65b112699a18771025cda674b3da7f2';
const flags = ['have_letter', 'apprentice_ok', 'valid_in_fumoquan'];
const short = t => t.path.split('/').at(-1).slice(0, -2);
function category(name) {
    if (name === 'da-mo') return 'damo';
    if (['qing-fa', 'qing-wei', 'qing-wu'].includes(name)) return 'entry';
    if (['qing-shan', 'qing-wen', 'qing-xiao'].includes(name)) return 'qing';
    if (['du-e', 'du-jie', 'du-nan'].includes(name)) return 'du';
    for (const prefix of ['cheng', 'dao', 'hui', 'xuan']) if (name.startsWith(prefix + '-')) return prefix;
    return 'unavailable';
}

export function shaolinRecruitConditions(relations, readSource) {
    const teachers = relations.objects.filter(t => t.group === 'shaolin');
    if (teachers.every(t => t.learning_permissions === undefined)) return [];
    assert.deepEqual(teachers.map(short).sort(), [...names].sort(), '少林NPC清单须重新核对');
    const evidence = [...shaolinRecruitSources].sort().map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), reviewed,
        '少林拜师源码变化，须重新核对');
    const result = [];
    function add(t, variant, success, extra = {}) {
        const source = readSource(t.path), name = short(t), kind = category(name);
        const naming = t.names.find(n => n.function === 'create');
        const id = /^\(\{\s*"([^"]+)"/.exec(naming.args[1].raw)?.[1];
        const family = /create_family\("([^"]+)", (\d+), "([^"]+)"/.exec(source);
        assert.ok(id);
        const generation = family ? Number(family[2]) : 0;
        const prefix = { cheng: '慧', dao: '清', hui: '道', xuan: '澄', du: '玄' }[kind] ?? '清';
        const actor = { skills: { force: 180, dodge: 180, parry: 180, buddhism: 180, ...extra.skills },
            mappings: {}, properties: { name: prefix + '试', gender: '男性', class: 'bonze',
                family: { family_name: '少林派', generation: kind === 'damo' ? 36 : generation + 1,
                    master_id: 'other master', master_name: '别位师父' },
                shen: 100000, str: 36, con: 40, dex: 36, int: 35, WPK: 3,
                combat_exp: 1000000, gongxian: 100, weiwang: 100,
                max_neili: 6000, neili: 6000, jing: 10000, eff_jing: 10000,
                potential: 10000, learned_points: 0, ...extra.properties },
            ...(extra.temp ? { temp: extra.temp } : {}), ...(extra.busy ? { busy: extra.busy } : {}) };
        const initialFlags = Object.fromEntries(flags.map(k => [k, extra.temp?.[k] ?? 0]));
        const line = source.split('\n').findIndex(l => /^void create\(/.test(l)) + 1;
        const entry = { id: `${t.path}:${line}:create`, path: t.path, sha256: t.sha256,
            function: 'create', line, role: 'teaching' };
        const teacher = { path: '/' + t.path.slice(0, -2), id, sha256: t.sha256 };
        const action = `apprentice ${id}`;
        const expected = { command_kind: 'apprentice', command_accepted: extra.accepted ?? 1,
            recruited: success, name_after: success && (kind === 'damo' || extra.promoted)
                ? (kind === 'damo' ? '渡' : prefix) + actor.properties.name[1] : actor.properties.name,
            family_after: success ? { family_name: family[1], master_id: id, master_name: naming.values[0],
                generation: generation + 1, title: '传人', privs: 0 } : actor.properties.family || {},
            flags_after: success && extra.promoted && ['cheng', 'dao', 'hui', 'xuan'].includes(kind)
                ? { ...initialFlags, have_letter: 0, apprentice_ok: 0 } : initialFlags,
            pending_apprentice: success || extra.accepted === 0 || extra.foreign ? false : true,
            pending_betrayer: !!extra.foreign,
            contribution_spent: success && !actor.properties.family ? actor.properties.gongxian : 0 };
        const steps = [expected];
        if (extra.foreign) steps.push({ ...expected, pending_apprentice: true });
        if (extra.repeat) steps.push({ ...expected, recruited: false, command_accepted: success ? 1 : 0 });
        if (extra.cancel) steps.push({ ...expected, recruited: false, action: 'apprentice cancel',
            command_accepted: expected.pending_apprentice ? 1 : 0, pending_apprentice: false });
        result.push({ id: `teaching-shaolin-recruit-${name}-${variant}`, stage: 'school', method: 'teaching',
            entry_id: entry.id, samples: 2, status: 'configured_not_executed', parameters: {
                teacher, topic: '拜师', teaching_profile: 'shaolin-recruit', teaching_kind: 'apprenticeship',
                action, actor, target: { skills: {}, mappings: {}, properties: {} }, named_participants: true,
                teaching_entry: entry, teaching_evidence: naming.evidence,
                qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
                fighting: false, observe_seconds: 0, not_applicable: '', monitored_grants: [],
                teaching_expectations: steps, expected: success ? 'observed' : 'refused', variant,
                recruit_category: kind, teacher_family: family ? { family_name: family[1], generation } : {},
                known_issue: kind === 'damo' && variant === 'int34' ? 'MA-018' : null,
                note: '原拜师及收徒命令；辈分、前置技能和阵法／推荐许可是显式实验初态，不代表自然取得。不中途写师承、意向或替换NPC回调；成功以实际新师承为准，不以命令受理为准。',
            } });
    }
    for (const t of teachers) {
        const name = short(t), kind = category(name), source = readSource(t.path);
        const family = /create_family\("([^"]+)", (\d+), "([^"]+)"/.exec(source);
        const gen = family ? Number(family[2]) : 0, enabled = kind !== 'unavailable';
        const setGeneration = generation => ({ family_name: '少林派', generation,
            master_id: 'other master', master_name: '别位师父' });
        add(t, 'baseline', enabled, { accepted: family ? 1 : 0 });
        add(t, 'repeat', enabled, { accepted: family ? 1 : 0, repeat: true });
        if (!enabled) { add(t, 'cancel', false, { accepted: family ? 1 : 0, cancel: true }); continue; }
        for (const field of ['detach/少林派', 'betrayer/少林派', 'betrayer/times'])
            add(t, ['detach', 'betrayer', 'betrayer-times'][['detach/少林派', 'betrayer/少林派', 'betrayer/times'].indexOf(field)], false,
                { properties: { [field]: 1 } });
        add(t, 'foreign-family', false, { properties: { family: { ...setGeneration(gen + 1), family_name: '武当派' } }, foreign: true });
        add(t, 'same-generation', false, { properties: { family: setGeneration(gen) }, accepted: 0 });
        add(t, 'senior-generation', false, { properties: { family: setGeneration(Math.max(0, gen - 1)) }, accepted: 0 });
        add(t, 'lay-disciple', kind === 'entry', { properties: { class: '' } });
        add(t, 'no-family', kind === 'entry', { properties: { family: 0 } });
        if (['cheng', 'dao', 'hui'].includes(kind)) add(t, 'wrong-name', false, { properties: { name: '测试' } });
        if (['cheng', 'dao', 'hui', 'xuan'].includes(kind)) {
            add(t, 'no-letter', false, { properties: { family: setGeneration(gen + 2) } });
            add(t, 'letter-permission', true, { properties: { family: setGeneration(gen + 2), name: '测试' },
                temp: { have_letter: 1, apprentice_ok: 1 }, promoted: true });
            add(t, 'too-junior', false, { properties: { family: setGeneration(gen + 3) },
                temp: { have_letter: 1, apprentice_ok: 1 } });
        }
        if (['qing', 'dao'].includes(kind)) {
            add(t, 'generation-zero', true, { properties: { family: { family_name: '少林派', generation: 0 } } });
            add(t, 'generation-zero-with-master', false, { properties: { family: setGeneration(0) }, accepted: 0 });
        }
        if (kind === 'xuan') add(t, 'luohan-permission', true, { properties: { family: setGeneration(gen + 2), name: '测试', luohan_winner: 1 }, promoted: true });
        if (kind === 'entry') for (const gender of ['女性', '无性']) add(t, gender === '女性' ? 'female' : 'sexless', false, { properties: { gender } });
        if (kind === 'du') {
            add(t, 'no-fumo-permission', false, { properties: { family: setGeneration(gen + 2) } });
            add(t, 'fumo-permission', true, { properties: { family: setGeneration(gen + 2), name: '测试' },
                skills: { force: 120, dodge: 120, parry: 120, buddhism: 120 }, temp: { valid_in_fumoquan: 1 }, promoted: true });
            for (const skill of ['force', 'dodge', 'parry', 'buddhism']) add(t, skill + '-low', false,
                { properties: { family: setGeneration(gen + 2) }, skills: { [skill]: 119 }, temp: { valid_in_fumoquan: 1 } });
        }
        if (kind === 'damo') {
            for (const [variant, props, success] of [['int34', { int: 34 }, true], ['int35', { int: 35 }, true],
                ['kills4', { WPK: 4 }, false], ['exp-low', { combat_exp: 999999 }, false],
                ['generation35', { family: setGeneration(35) }, false], ['generation37', { family: setGeneration(37) }, false]])
                add(t, variant, success, { properties: props });
            for (const skill of ['force', 'dodge', 'parry', 'buddhism']) add(t, skill + '-low', false, { skills: { [skill]: 179 } });
        }
        if (name === 'qing-fa') add(t, 'busy', false, { busy: 5, accepted: 0 });
    }
    return result;
}
