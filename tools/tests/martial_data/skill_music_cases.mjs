// Frozen public music skill cases: valid_learn boundaries and original play/do_effect
// observations for the 11 public songs. Statistics only; no balance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');

export const skillMusicSongs = {
    anthem: { skill: 'chinese-anthem', technique: 'tanqin-jifa', instrument: 'qin', learn_gate: 0 },
    guangsan: { skill: 'guangling-san', technique: 'tanqin-jifa', instrument: 'qin', learn_gate: 50 },
    jianjia: { skill: 'jian-jia', technique: 'tanqin-jifa', instrument: 'qin', learn_gate: 30 },
    qingxin: { skill: 'qingxin-pushan', technique: 'tanqin-jifa', instrument: 'qin', learn_gate: 50 },
    qiuyue: { skill: 'qiuyue-lai', technique: 'tanqin-jifa', instrument: 'qin', learn_gate: 50 },
    xiaoxiang: { skill: 'xiaoxiang-yeyu', technique: 'tanqin-jifa', instrument: 'qin', learn_gate: 50 },
    tieqin: { skill: 'tieqin-yin', technique: 'tanqin-jifa', instrument: 'qin', learn_gate: 100 },
    xiyu: { skill: 'xiyu-tiezheng', technique: 'guzheng-jifa', instrument: 'zheng', learn_gate: 100 },
    wushe: { skill: 'wushe-qu', technique: 'guzheng-jifa', instrument: 'zheng', learn_gate: 100 },
    xiaoao: { skill: 'xiaoao-jianghu', technique: 'tanqin-jifa', instrument: 'qin', learn_gate: 50 },
    qixian: { skill: 'qixian-wuxingjian', technique: 'tanqin-jifa', instrument: 'qin', learn_gate: 100 },
};

export const skillMusicInstruments = {
    qin: { program: '/d/items/qin/muqin', input_id: 'muqin', play_fn: 'play_qin',
        valid_key: 'valid_as_qin', preparation_action: 'hand muqin' },
    zheng: { program: '/d/items/zheng/guzheng', input_id: 'zheng', play_fn: 'play_zheng',
        valid_key: 'valid_as_zheng', preparation_action: 'hand zheng' },
    xiao: { program: '/d/items/xiao/zhuxiao', input_id: 'xiao', play_fn: 'play_xiao',
        valid_key: 'valid_as_xiao', preparation_action: 'hand xiao' },
};

export const skillMusicSourcePaths = [
    'kungfu/skill/chinese-anthem.c', 'kungfu/skill/guangling-san.c', 'kungfu/skill/jian-jia.c',
    'kungfu/skill/qingxin-pushan.c', 'kungfu/skill/qiuyue-lai.c', 'kungfu/skill/qixian-wuxingjian.c',
    'kungfu/skill/tieqin-yin.c', 'kungfu/skill/wushe-qu.c', 'kungfu/skill/xiaoao-jianghu.c',
    'kungfu/skill/xiaoxiang-yeyu.c', 'kungfu/skill/xiyu-tiezheng.c',
    'kungfu/skill/tanqin-jifa.c', 'kungfu/skill/guzheng-jifa.c', 'kungfu/skill/chuixiao-jifa.c',
    'inherit/misc/_qin.c', 'inherit/misc/_zheng.c', 'inherit/misc/_xiao.c',
    'd/items/qin.lpc', 'd/items/qin_data.h', 'd/items/zheng.lpc', 'd/items/zheng_data.h',
    'd/items/xiao.lpc', 'd/items/xiao_data.h',
    'clone/beast/caihuashe.c', 'inherit/char/snake.c',
    'cmds/std/hand.c', 'cmds/std/wield.c', 'cmds/std/drop.c', 'cmds/std/halt.c',
    'feature/skill.c', 'feature/action.c', 'feature/attack.c', 'feature/condition.c',
    'feature/damage.c', 'feature/equip.c', 'feature/move.c', 'feature/name.c', 'feature/attribute.c',
    'inherit/char/char.c', 'inherit/misc/equip.c', 'adm/daemons/itemd.c',
    'adm/single/simul_efun/message.c', 'mudcore/inherit/action.c', 'mudcore/inherit/dbase.c',
    'include/globals.h', 'include/weapon.h', 'include/music.h', 'mudcore/include/ansi.h',
];

export const skillMusicFixtureRequirements = [
    'Reuse the established method music executor with collection_group public-music: three connected nonwizard USERs and original force_me(play ... with instrument); never call do_effect as the measured entry.',
    'Qin fixture is the original clonable dali yaoqin (valid_as_qin, play_qin owner); zheng is the original virtual guzheng variety of /d/items/zheng; no substitute instruments.',
    'valid_learn conditions use the original test_interface valid_learn call and its exact notify_fail refusal text; misspelled skill keys are only asserted absent, never created.',
    'Record music_steps with per-step three-user before/after, per-side receive_message transcripts and original command cost; notify_fail is command prompt evidence, not a state change.',
    'Heal songs: one shared random(lvl)+10 (jing) or random(lvl)+20 (qi) argument per array call; listeners heal equal amounts, capped by their own max; do not infer the hidden random value when both cap.',
    'Hostile songs keep original branch order (same-family 2/3 exemption, die_guard exemption where present, force check lvl+random(lvl), max-neili gap gate 500) and original want_kill/fight_ob/kill_ob hostility; branch skips are not misses.',
    'wushe-qu keeps original neili accounting (refuse-and-zero below 50, cost 20+random(10) otherwise), original room quarrys weighted pick and original snake class check; empty rooms are not failures.',
    'Freeze this module/test and source_evidence only in a new series. Cleanup exact created instrument/snake/USER references after recording, never historical evidence or real player data.',
];

const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 3000, max_neili: 3000, jingli: 1000, str: 36, int: 36, con: 36,
    dex: 34, age: 30, gender: '男性', jiali: 0, combat_exp: 100000000, shen: 0,
    character: '光明磊落' };

function actorConfig(changes = {}) {
    return { skills: { ...changes.skills }, mappings: {}, preparations: {},
        properties: { ...defaults, ...changes.properties },
        ...(changes.conditions ? { conditions: changes.conditions } : {}),
        ...(changes.busy ? { busy: changes.busy } : {}),
        ...(changes.temp ? { temp: changes.temp } : {}) };
}

export function skillMusicLearnConditions(catalog, readSource) {
    const evidence = Object.fromEntries(skillMusicSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length > 0, path);
        return [path, hash(bytes)];
    }));
    const rows = [];
    const addLearn = (tag, song, skills, properties, expected, reason = '', note = '') => {
        const spec = skillMusicSongs[song], source = catalog.skills.find(s => s.id === spec.skill);
        assert.equal(source?.path, 'kungfu/skill/' + spec.skill + '.c');
        assert.equal(source.sha256, evidence[source.path]);
        const entry = source.entries.find(e => e.id.endsWith(':valid_learn'))?.id;
        assert.ok(entry && entry.startsWith(source.path + ':'));
        rows.push({ id: 'skill-music-' + song + '-learn-' + tag, stage: 'skill', entry_id: entry,
            method: 'interface', samples: 2,
            parameters: { collection_group: 'public-music', song, skill: spec.skill, variant: 'learn-' + tag,
                actor: actorConfig({ skills, properties }), target: actorConfig(),
                interface: { object: '/' + source.path.slice(0, -2), function: 'valid_learn' },
                action: 'test_interface', fighting: false, observe_seconds: 0,
                observation: 'single_action_immediate', not_applicable: '',
                expected, expected_reason: reason, effect: { kind: 'learn' },
                qualification_sources: [source.path, 'feature/skill.c'],
                source_evidence: { ...evidence },
                qualification_note: note || 'Direct original valid_learn observation; not teacher instruction or practice success. Misspelled skill keys only asserted absent.' } });
    };
    for (const song of ['guangsan', 'jianjia', 'qingxin', 'qiuyue', 'xiaoxiang', 'tieqin', 'xiyu', 'wushe']) {
        const spec = skillMusicSongs[song], t = spec.technique, gate = spec.learn_gate;
        addLearn('gate-' + (gate - 1), song, { [t]: gate - 1 }, {}, 'refused');
        addLearn('gate-' + gate, song, { [t]: gate }, {}, 'observed');
        addLearn('rel-ok', song, { [t]: 100, [spec.skill]: 100 }, {}, 'observed');
        addLearn('rel-block', song, { [t]: 100, [spec.skill]: 101 }, {}, song === 'jianjia' ? 'observed' : 'refused',
            '', song === 'jianjia' ? 'MA-121: own level gate inert; observed is current buggy behavior.' : '');
    }
    // MA-121 evidence: jian-jia relative gate reads qiuyue-lai, not its own level.
    addLearn('relgate-qiuyue-block', 'jianjia', { 'tanqin-jifa': 50, 'jian-jia': 50, 'qiuyue-lai': 51 }, {}, 'refused',
        '', 'MA-121: gate compares qiuyue-lai level; expected refusal is current buggy behavior, not design.');
    addLearn('relgate-self-inert', 'jianjia', { 'tanqin-jifa': 50, 'jian-jia': 51, 'qiuyue-lai': 0 }, {}, 'observed',
        '', 'MA-121: own level never binds the relative gate.');
    addLearn('any', 'anthem', {}, {}, 'observed');
    addLearn('leveled', 'anthem', { 'chinese-anthem': 300, 'tanqin-jifa': 300 }, {}, 'observed');
    addLearn('both-low', 'xiaoao', { 'tanqin-jifa': 49, 'chuixiao-jifa': 49 }, {}, 'refused');
    addLearn('tanqin50', 'xiaoao', { 'tanqin-jifa': 50 }, {}, 'observed');
    addLearn('xiao50', 'xiaoao', { 'chuixiao-jifa': 50 }, {}, 'observed');
    addLearn('typo-block', 'xiaoao', { 'tanqin-jifa': 50, 'chuixiao-jifa': 100, 'qingxin-pushan': 51 }, {}, 'refused',
        '', 'MA-005.10: real chuixiao 100 still refuses because the gate reads misspelled cuhixiao-jifa.');
    addLearn('qingxin-pass', 'xiaoao', { 'tanqin-jifa': 51, 'qingxin-pushan': 51 }, {}, 'observed');
    for (const [tag, skills, properties, expected] of [
        ['force269', { force: 538, unarmed: 540, sword: 540, 'tanqin-jifa': 180, 'qixian-wuxingjian': 0 }, { max_neili: 3000 }, 'refused'],
        ['force270', { force: 540, unarmed: 540, sword: 540, 'tanqin-jifa': 180, 'qixian-wuxingjian': 0 }, { max_neili: 3000 }, 'observed'],
        ['neili2999', { force: 540, unarmed: 540, sword: 540, 'tanqin-jifa': 180, 'qixian-wuxingjian': 0 }, { max_neili: 2999 }, 'refused'],
        ['neili3000', { force: 540, unarmed: 540, sword: 540, 'tanqin-jifa': 180, 'qixian-wuxingjian': 0 }, { max_neili: 3000 }, 'observed'],
        ['unarmed179', { force: 540, unarmed: 179, sword: 540, 'tanqin-jifa': 180, 'qixian-wuxingjian': 0 }, { max_neili: 3000 }, 'refused'],
        ['unarmed180', { force: 540, unarmed: 180, sword: 540, 'tanqin-jifa': 180, 'qixian-wuxingjian': 0 }, { max_neili: 3000 }, 'observed'],
        ['sword179', { force: 540, unarmed: 540, sword: 179, 'tanqin-jifa': 180, 'qixian-wuxingjian': 0 }, { max_neili: 3000 }, 'refused'],
        ['sword180', { force: 540, unarmed: 540, sword: 180, 'tanqin-jifa': 180, 'qixian-wuxingjian': 0 }, { max_neili: 3000 }, 'observed'],
        ['tanqin99', { force: 540, unarmed: 540, sword: 540, 'tanqin-jifa': 99, 'qixian-wuxingjian': 0 }, { max_neili: 3000 }, 'refused'],
        ['tanqin100', { force: 540, unarmed: 540, sword: 540, 'tanqin-jifa': 100, 'qixian-wuxingjian': 0 }, { max_neili: 3000 }, 'observed'],
        ['rel-force-block', { force: 540, unarmed: 540, sword: 540, 'tanqin-jifa': 180, 'qixian-wuxingjian': 541 }, { max_neili: 3000 }, 'refused'],
        ['rel-force-ok', { force: 541, unarmed: 541, sword: 541, 'tanqin-jifa': 181, 'qixian-wuxingjian': 541 }, { max_neili: 3000 }, 'observed'],
        ['rel-tanqin-block', { force: 540, unarmed: 540, sword: 540, 'tanqin-jifa': 100, 'qixian-wuxingjian': 303 }, { max_neili: 3000 }, 'refused'],
        ['rel-tanqin-ok', { force: 540, unarmed: 540, sword: 540, 'tanqin-jifa': 101, 'qixian-wuxingjian': 303 }, { max_neili: 3000 }, 'observed'],
    ]) addLearn(tag, 'qixian', skills, properties, expected);
    return rows;
}

export function skillMusicConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(skillMusicSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length > 0, path);
        return [path, hash(bytes)];
    }));
    const rows = [];
    const add = (song, tag, effect, extra = {}) => {
        const spec = skillMusicSongs[song], instrument = skillMusicInstruments[spec.instrument];
        const level = extra.level ?? 200, source = catalog.skills.find(s => s.id === spec.skill);
        assert.equal(source?.path, 'kungfu/skill/' + spec.skill + '.c');
        assert.equal(source.sha256, evidence[source.path]);
        const entry = source.entries.find(e => e.id.endsWith(':do_effect'))?.id;
        assert.ok(entry && entry.startsWith(source.path + ':'));
        const technique = spec.technique;
        const config = (changes = {}) => actorConfig({ skills: { [technique]: level, [spec.skill]: level,
            force: 600, ...extra.actorSkills, ...changes.skills },
            properties: { neili: 6000, max_neili: 6000, ...extra.actorProps, ...changes.properties },
            ...(changes.conditions ? { conditions: changes.conditions } : {}),
            ...(changes.busy ? { busy: changes.busy } : {}),
            ...(changes.temp ? { temp: changes.temp } : {}) });
        const listener = (changes = {}) => actorConfig({ skills: { force: 2, ...changes.skills },
            properties: { jing: 1000, ...changes.properties },
            ...(changes.conditions ? { conditions: changes.conditions } : {}),
            ...(changes.temp ? { temp: changes.temp } : {}) });
        const action = extra.empty ? 'play' : `play ${spec.skill} with ${instrument.input_id}`;
        rows.push({ id: 'skill-music-' + song + '-' + tag, stage: 'skill', entry_id: entry,
            // Every original play command has random busy/message behavior;
            // use the requested formal count, not an unused variant name.
            method: 'music', samples: smoke ? 1 : samples,
            parameters: { collection_group: 'public-music', song, skill: spec.skill, variant: tag, level,
                actor: config(extra.actor), target: listener(extra.target), extra_target: listener(extra.third),
                instrument: { ...instrument }, named_participants: true, fighting: false,
                room: extra.room ?? {}, action,
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                observation: 'single_action_immediate', observe_seconds: 0, not_applicable: '',
                effect, ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                qualification_sources: [source.path, 'feature/skill.c'],
                source_evidence: { ...evidence },
                qualification_note: extra.note || 'Three real nonwizard USERs; learned songs are experimental inputs, not book/teacher cost. Original instrument play entry only; do_effect is never the measured entry. Random and clocks untouched.' } });
    };
    for (const song of ['guangsan', 'qingxin', 'qiuyue']) {
        add(song, 'below100', { kind: 'silent', formula: 'jing', base: 10 },
            { actorSkills: { 'tanqin-jifa': 100, [skillMusicSongs[song].skill]: 48 } });
        add(song, 'heal-baseline', { kind: 'heal', formula: 'jing', base: 10 });
        add(song, 'heal-cap', { kind: 'heal', formula: 'jing', base: 10 },
            { target: { properties: { jing: 9998 } }, third: { properties: { jing: 9999 } } });
    }
    add('xiaoxiang', 'below100', { kind: 'silent', formula: 'qi', base: 20 },
        { actorSkills: { 'tanqin-jifa': 100, 'xiaoxiang-yeyu': 48 } });
    add('xiaoxiang', 'heal-baseline', { kind: 'heal', formula: 'qi', base: 20 });
    add('xiaoxiang', 'heal-cap', { kind: 'heal', formula: 'qi', base: 20 },
        { target: { properties: { qi: 9996 } }, third: { properties: { qi: 9998 } } });
    add('jianjia', 'message-only', { kind: 'message-only' });
    add('jianjia', 'love-listener', { kind: 'message-only', love: true },
        { third: { temp: { love: 'left' } } });
    add('anthem', 'below200', { kind: 'silent' },
        { actorSkills: { 'chinese-anthem': 199, 'tanqin-jifa': 100 } });
    add('anthem', 'nofighter', { kind: 'anthem-quiet' },
        { actorSkills: { 'chinese-anthem': 200, 'tanqin-jifa': 100 } });
    add('tieqin', 'below150', { kind: 'silent' },
        { actorSkills: { 'tieqin-yin': 49, 'tanqin-jifa': 200 } });
    add('tieqin', 'nofight', { kind: 'silent' }, { room: { no_fight: 1 } });
    add('tieqin', 'skybook', { kind: 'silent' }, { room: { skybook: 1 } });
    add('tieqin', 'guard-skip', { kind: 'hostile', branch: 'guarded' },
        { target: { conditions: { die_guard: 100 } }, third: { conditions: { die_guard: 100 } } });
    add('tieqin', 'force-skip', { kind: 'hostile', branch: 'force-skip' },
        { target: { skills: { force: 100000 } }, third: { skills: { force: 100000 } } });
    add('tieqin', 'smallgap', { kind: 'hostile', branch: 'small-gap' },
        { target: { properties: { max_neili: 5501 } }, third: { properties: { max_neili: 5501 } } });
    add('tieqin', 'damage', { kind: 'hostile', branch: 'damage', formula: 'tieqin' },
        { target: { properties: { max_neili: 5000 } }, third: { properties: { max_neili: 5000 } } });
    add('xiyu', 'below150', { kind: 'silent' },
        { actorSkills: { 'xiyu-tiezheng': 49, 'guzheng-jifa': 200 } });
    add('xiyu', 'damage', { kind: 'hostile', branch: 'damage', formula: 'xiyu' },
        { target: { properties: { max_neili: 5000 } }, third: { properties: { max_neili: 5000 } } });
    add('xiyu', 'guard-hit', { kind: 'hostile', branch: 'damage', formula: 'xiyu' },
        { target: { properties: { max_neili: 5000 }, conditions: { die_guard: 100 } } });
    add('qixian', 'below150', { kind: 'silent' },
        { actorSkills: { 'qixian-wuxingjian': 49, 'tanqin-jifa': 200 } });
    add('qixian', 'far-gap', { kind: 'hostile', branch: 'far-gap' },
        { target: { properties: { max_neili: 5 } }, third: { properties: { max_neili: 5 } } });
    add('qixian', 'me-weak', { kind: 'hostile', branch: 'me-weak' },
        { actorProps: { max_neili: 5400 }, target: { properties: { max_neili: 5000 } },
            third: { properties: { max_neili: 5000 } } });
    add('qixian', 'damage', { kind: 'hostile', branch: 'damage', formula: 'qixian' },
        { target: { properties: { max_neili: 5000 } }, third: { properties: { max_neili: 5000 } } });
    add('wushe', 'nofight', { kind: 'silent' }, { room: { no_fight: 1 } });
    add('wushe', 'below50', { kind: 'wushe-silent-msg' },
        { actorSkills: { 'wushe-qu': 49, 'guzheng-jifa': 100 } });
    add('wushe', 'neili-zero', { kind: 'wushe-neili', branch: 'zero' }, { actorProps: { neili: 49 } });
    add('wushe', 'no-quarrys', { kind: 'wushe-neili', branch: 'no-quarrys' }, {});
    add('wushe', 'snake', { kind: 'wushe-neili', branch: 'snake' }, { room: { quarrys: { caihuashe: 10 } } });
    // Effective music level is technique/2 + song, not the song's raw level.
    // These are explicit experimental skills, not proof of natural learning.
    add('wushe', 'edge-effective49', { kind: 'wushe-boundary', branch: 'below50' },
        { actorSkills: { 'guzheng-jifa': 2, 'wushe-qu': 48 } });
    add('wushe', 'edge-effective50', { kind: 'wushe-boundary', branch: 'at50' },
        { actorSkills: { 'guzheng-jifa': 2, 'wushe-qu': 49 } });
    add('xiaoao', 'solo', { kind: 'xiaoao-solo', marker: 'xajh/qin' });
    add('xiaoao', 'below100', { kind: 'silent' },
        { actorSkills: { 'xiaoao-jianghu': 99, 'tanqin-jifa': 200 } });
    return rows;
}

const map = (v, label = 'mapping') => { assert.ok(v && typeof v === 'object' && !Array.isArray(v), label); return v; };
const field = (v, k) => { assert.ok(Object.hasOwn(v, k), 'missing ' + k); return v[k]; };
const integer = (v, label = 'integer') => { assert.ok(Number.isSafeInteger(v) && v >= 0, label); return v; };
const absent = (v, label) => assert.ok(v === null || v === 0, label);
const idle = s => { const b = field(s, 'busy'); return b === null ? 0 : integer(b); };
const strip = text => String(text ?? '').replace(/\[[0-?]*[ -/]*[@-~]/g, '');

function learnerState(s, config, label) {
    assert.match(s?.object ?? '', /^\/tests\/actor#\d+$/, label);
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(s[key], 1, label + ' ' + key);
    for (const key of ['wizardp', 'ghost']) assert.equal(s[key], 0, label + ' ' + key);
    for (const [key, value] of Object.entries(config.properties)) {
        const actual = key.includes('/') || key === 'character'
            ? (s.cultivation ?? {})[key] : s[key];
        assert.equal(actual, value, label + ' property ' + key);
    }
    for (const [key, value] of Object.entries(config.skills))
        assert.equal(s.skills[key] ?? 0, value, label + ' skill ' + key);
    const wrong = ['cuhixiao-jifa', 'choushui-zhang', 'lenyue-shengong', 'xuanyuan-arror',
        'yaowang-mishu', 'xuan-huntun', 'qiu-yue-lai', 'jianjia'];
    for (const key of wrong) assert.equal(s.skills[key] ?? 0, 0, label + ' misspelled ' + key);
    assert.equal(s.weapon, 'none');
}

function musicListener(s, label) {
    assert.match(s?.object ?? '', /^\/tests\/actor#\d+$/, label);
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(s[key], 1, label);
    for (const key of ['wizardp', 'ghost']) assert.equal(s[key], 0, label);
    for (const key of ['jing', 'eff_jing', 'max_jing', 'qi', 'eff_qi', 'max_qi', 'neili', 'max_neili'])
        assert.ok(Object.hasOwn(s, key), label + ' ' + key);
}

export function validateSkillMusicRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'public-music');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, condition.method);
    if (raw.outcome === 'error') return;
    assert.equal(raw.outcome, p.expected);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1);
        assert.deepEqual(raw.interfaces[0], { ...p.interface, result: p.expected === 'observed' ? 1 : 0 });
        assert.deepEqual(raw.metrics, [{}, {}]);
        learnerState(raw.before[0], p.actor, 'before');
        const stripState = s => { const t = { ...s, temp: { ...(s.temp ?? {}) } }; delete t.temp.notify_fail; return t; };
        assert.deepEqual(raw.immediate.map(stripState), raw.before.map(stripState));
        assert.deepEqual(raw.after.map(stripState), raw.before.map(stripState));
        if (p.expected_reason) assert.ok(strip(raw.reason).includes(p.expected_reason), 'refusal must match branch text');
        return;
    }
    assert.equal(raw.music_steps.length, 1);
    const step = raw.music_steps[0];
    assert.equal(step.action, p.action);
    assert.ok(Number.isSafeInteger(step.accepted) && step.accepted >= 0);
    assert.equal(raw.command_accepted, step.accepted);
    const accepted = step.accepted > 0;
    assert.equal(accepted, p.expected === 'observed');
    if (!accepted) assert.equal(strip(step.reason).trim(), strip(p.refusal).trim());
    const prep = map(raw.music_preparation, 'music_preparation');
    assert.equal(prep.action, p.instrument.preparation_action);
    assert.equal(prep.actor, raw.before[0].object);
    const inst = map(prep.after.instrument, 'instrument');
    assert.equal(inst.program, p.instrument.program);
    assert.equal(inst.input_id, p.instrument.input_id);
    assert.equal(inst.play_owner, '/inherit/misc/' + p.instrument.play_fn.replace('play_', '_'));
    assert.equal(prep.before.instrument.object, inst.object);
    assert.deepEqual(raw.after, raw.immediate, 'immediate is the post-window truth');
    assert.deepEqual(field(raw, 'extra_target_after'), field(raw, 'extra_target_immediate'));
    const before = [raw.before[0], raw.before[1], field(raw, 'extra_target_before')];
    const after = [raw.immediate[0], raw.immediate[1], field(raw, 'extra_target_immediate')];
    assert.equal(new Set(before.map(s => s.object)).size, 3, 'three distinct USERs');
    for (let i = 0; i < 3; i++) musicListener(before[i], 'before' + i);
    assert.ok(idle(after[0]) >= 3 && idle(after[0]) <= 5, 'original play busy 3+random(3)');
    const ctxB = map(raw.music_context_before, 'context'), ctxA = map(raw.music_context_after, 'context');
    const room = map(ctxB.room, 'room'); assert.equal(room.object, '/tests/runner');
    for (const key of ['no_fight', 'skybook']) {
        const v = field(room, key);
        if (p.room[key]) assert.equal(v, p.room[key]); else absent(v, key);
    }
    assert.deepEqual(ctxA.room, ctxB.room);
    const obs = { accepted, effect: p.effect, level: p.level, before, after, params: p,
        transformed: Math.trunc((p.actor.skills[skillMusicSongs[p.song].technique] ?? 0) / 2)
            + (p.actor.skills[p.skill] ?? 0),
        messages: field(step, 'messages'), ctxA };
    checkSkillMusicEffect(obs);
    return obs;
}

export function skillMusicEffects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); const raw = row.raw ?? row;
        assert.equal(raw.condition_id, condition.id);
        if (row.raw) assert.equal(row.outcome, raw.outcome);
        assert.ok(Object.hasOwn(counts, raw.outcome)); counts[raw.outcome]++;
        if (['observed', 'refused'].includes(raw.outcome)) {
            const observation = validateSkillMusicRecord(raw, condition);
            known.push(condition.method === 'interface'
                ? { accepted: raw.interfaces[0].result === 1 } : observation);
        }
    }
    const accepted = known.filter(x => x && x.accepted);
    return { counts, samples: rows.length,
        acceptance: probability(accepted.length, known.length),
        refusal: probability(counts.refused, known.length),
        effect_kind: condition.parameters.effect.kind,
        branch: condition.parameters.effect.branch ?? null,
        level: condition.parameters.level };
}

export function checkSkillMusicEffect(obs) {
    const p = obs.effect, before = obs.before, after = obs.after, delta = (i, key) => after[i][key] - before[i][key];
    const messages = obs.messages;
    assert.ok(Array.isArray(messages) && messages.length >= 3, 'per-step three-side transcripts');
    const sideText = side => messages.filter(m => m.side === side).map(m => m.text).join('\n');
    if (p.kind === 'silent') {
        for (let i = 1; i <= 2; i++) for (const key of ['jing', 'eff_jing', 'qi', 'eff_qi', 'neili'])
            assert.equal(delta(i, key), 0, 'silent no effect ' + key);
    } else if (p.kind === 'message-only') {
        for (let i = 1; i <= 2; i++) for (const key of ['jing', 'eff_jing', 'qi', 'eff_qi'])
            assert.equal(delta(i, key), 0, 'message-only no state change');
        if (p.love) assert.ok(sideText(2).includes('伊人'), 'love listener message');
        else assert.ok(!sideText(2).includes('难道是我么'), 'no love marker no special message');
    } else if (p.kind === 'anthem-quiet') {
        assert.ok(sideText(0).includes('慷慨激昂') || sideText(1).includes('慷慨激昂') || sideText(2).includes('慷慨激昂'),
            'original anthem message');
        for (let i = 1; i <= 2; i++) assert.equal(delta(i, 'jing'), 0);
    } else if (p.kind === 'heal') {
        const key = p.formula, base = p.base;
        const maxKey = key === 'jing' ? 'max_jing' : 'max_qi';
        const gains = [delta(1, key), delta(2, key)];
        const headroom = [before[1][maxKey] - before[1][key], before[2][maxKey] - before[2][key]];
        for (const g of gains) assert.ok(g >= 0, 'no negative heal');
        const bound = obs.transformed + base - 1;
        for (let i = 0; i < 2; i++) {
            assert.ok(gains[i] >= Math.min(base, Math.max(0, headroom[i])),
                'minimum original random(lvl)+base healing, capped by headroom');
            assert.ok(gains[i] <= Math.min(bound, headroom[i]), 'within random(lvl)+base and headroom');
        }
        if (headroom[0] >= bound && headroom[1] >= bound)
            assert.equal(gains[0], gains[1], 'shared random per array call when uncapped');
        for (let i = 1; i <= 2; i++) {
            assert.equal(delta(i, p.formula === 'jing' ? 'eff_jing' : 'eff_qi'), 0, 'heal not wound');
            assert.ok(after[i][key] <= after[i][maxKey], 'capped');
        }
    } else if (p.kind === 'hostile') {
        for (let i = 1; i <= 2; i++) {
            if (p.branch === 'guarded') { assert.equal(delta(i, 'jing'), 0, 'die_guard exemption'); continue; }
            if (['force-skip', 'small-gap', 'far-gap', 'me-weak'].includes(p.branch)) {
                assert.equal(delta(i, 'jing'), 0, 'gate branch exemption');
                continue;
            }
            const gap = before[0].max_neili - before[i].max_neili;
            assert.ok(gap >= 500, 'damage needs max-neili gap >= 500');
            const d = Math.trunc(gap / 10);
            const expect = p.formula === 'tieqin' ? [Math.trunc(d * 2 / 3), Math.trunc(d * 2 / 9)]
                : p.formula === 'xiyu' ? [d, Math.trunc(d / 3)]
                    : [Math.trunc(d / 2), Math.trunc(d / 2)];
            assert.equal(delta(i, 'jing'), -expect[0], 'original jing damage');
            assert.equal(delta(i, 'eff_jing'), -expect[1], 'original jing wound');
            if (p.formula === 'qixian') {
                assert.equal(delta(i, 'qi'), -d * 2, 'original qixian qi damage');
                assert.equal(delta(i, 'eff_qi'), -d * 2, 'original qixian qi wound');
            }
        }
    } else if (p.kind === 'wushe-neili') {
        if (p.branch === 'zero') {
            assert.equal(after[0].neili, 0, 'neili zeroed branch');
        } else {
            const cost = before[0].neili - after[0].neili;
            assert.ok(cost >= 20 && cost <= 29, 'original neili cost 20+random(10)');
            const snakes = obs.ctxA.inventory.filter(name => name.includes('/clone/beast/'));
            if (p.branch === 'snake') assert.equal(snakes.length, 1, 'one original snake');
            else assert.equal(snakes.length, 0, 'no quarrys no snake');
        }
    } else if (p.kind === 'wushe-boundary') {
        assert.equal(obs.transformed, p.branch === 'below50' ? 49 : 50, 'exact original combined music level');
        for (let i = 1; i <= 2; i++) for (const key of ['jing', 'eff_jing', 'qi', 'eff_qi', 'neili'])
            assert.equal(delta(i, key), 0, 'boundary does not alter listeners');
        if (p.branch === 'below50') {
            assert.equal(delta(0, 'neili'), 0, 'below50 returns before charging');
            assert.ok(sideText(0).includes('满头大汗'), 'original below50 branch message');
        } else {
            const cost = -delta(0, 'neili');
            assert.ok(cost >= 20 && cost <= 29, 'at50 reaches original random cost');
            assert.ok(sideText(0).includes('没有一条蛇出来'), 'at50 reaches missing-quarrys branch');
        }
        assert.equal(obs.ctxA.inventory.filter(name => name.includes('/clone/beast/')).length, 0);
    } else if (p.kind === 'wushe-silent-msg') {
        for (let i = 1; i <= 2; i++) assert.equal(delta(i, 'jing'), 0);
    } else if (p.kind === 'xiaoao-solo') {
        for (let i = 1; i <= 2; i++) {
            const t = map(after[i].temp, 'temp');
            const bag = map(t.xajh ?? { qin: 0 }, 'xajh bag');
            assert.ok(Object.hasOwn(bag, 'qin') || Object.hasOwn(bag, 'xiao'), 'original xajh marker');
            assert.equal(bag.powerup ?? 0, 0, 'solo play no duet powerup');
        }
    } else assert.ok(false, 'unknown effect kind ' + p.kind);
}
