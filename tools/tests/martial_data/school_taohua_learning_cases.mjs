// Independent preparation only: not registered, not an LPC executor, no collected samples.
import assert from 'node:assert/strict';
import { sha256, scanSource } from './inventory.mjs';

const copy = value => structuredClone(value);
const map = (v, label = 'mapping') => assert.ok(v && typeof v === 'object' && !Array.isArray(v), label);
const own = (o, k) => { map(o); assert.ok(Object.hasOwn(o, k), 'missing observation: ' + k); return o[k]; };
const integer = (v, label = 'integer') => assert.ok(Number.isSafeInteger(v) && v >= 0, label);
const zero = v => v === null || v === 0;
const absentEqual = (v, e, label) => e === 0 || e === null ? assert.ok(zero(v), label) : assert.deepEqual(v, e, label);
const grantKeys = ['can_learn/huang/count', 'can_learn/huang/bibo-shengong', 'can_learn/huang/tanzhi-shentong'];
const historyKeys = ['detach/桃花岛', 'betrayer/桃花岛', 'betrayer/times'];
const knowledge = new Set(['literate', 'medical', 'qimen-wuxing', 'count', 'jingluo-xue', 'mathematics',
    'chuixiao-jifa', 'bihai-chaosheng', 'taohua-yuan', 'taohua-yaoli']);
const technic = new Set(['drawing', 'chess', 'calligraphy']);
export const taohuaLearningTeachers = [
    ['huang', '黄药师', 'huang yaoshi', 1], ['feng', '冯默风', 'feng mofeng', 2],
    ['lu', '陆乘风', 'lu chengfeng', 2], ['qu', '曲灵风', 'qu lingfeng', 2],
    ['rong', '黄蓉', 'huang rong', 2], ['chen', '陈玄风', 'chen xuanfeng', 2], ['mei', '梅超风', 'mei chaofeng', 2],
].map(([key, name, id, generation]) => ({ key, name, id, generation, path: '/kungfu/class/taohua/' + key }));
const teacher = key => { const t = taohuaLearningTeachers.find(t => t.key === key); assert.ok(t, key); return t; };
export const taohuaLearningBooks = [
    ['taohua', '桃花药理', 'taohua yaoli', 'taohua-yaoli', 30, 159, 60, 40],
    ['xiaopu', '箫谱', 'xiao pu', 'chuixiao-jifa', 0, 149, 30, 30],
    ['xuanfengtui', '旋风扫叶腿', 'xuanfeng paper', 'xuanfeng-tui', 0, 119, 100, 30],
    ['hetu', '河图', 'he tu', 'count', 100, 199, 80, 80],
    ['luoshu', '洛书', 'luo shu', 'count', 200, 299, 120, 120],
].map(([key, topic, id, skill, min, max, jing, difficulty]) => ({ key, topic, id, skill, min, max, jing, difficulty,
    path: '/clone/lonely/book/' + key, count: key === 'hetu' || key === 'luoshu' }));
const bookOf = key => { const b = taohuaLearningBooks.find(b => b.key === key); assert.ok(b, key); return b; };
const allSkills = ('force bibo-shengong luoying-xinfa hand finger canglang-zhi tanzhi-shentong unarmed strike '
    + 'pikong-zhang luoying-shenzhang xuanfeng-tui dodge anying-fuxiang parry sword throwing luoying-shenjian '
    + 'yuxiao-jian lanhua-shou qimen-wuxing count jingluo-xue mathematics literate chuixiao-jifa '
    + 'bihai-chaosheng taohua-yuan drawing chess calligraphy medical taohua-yaoli martial-cognize').split(' ');
export const taohuaLearningSourcePaths = [...new Set([
    ...taohuaLearningTeachers.map(t => t.path.slice(1) + '.c'), 'kungfu/class/taohua/taohua.h',
    ...taohuaLearningBooks.map(b => b.path.slice(1) + '.c'), ...allSkills.map(s => 'kungfu/skill/' + s + '.c'),
    'cmds/skill/learn.c', 'cmds/skill/study.c', 'cmds/skill/apprentice.c', 'cmds/skill/recruit.c',
    'cmds/std/ask.c', 'cmds/std/give.c', 'feature/apprentice.c', 'feature/attribute.c', 'feature/skill.c',
    'feature/command.c', 'feature/master.c', 'feature/dbase.c', 'feature/move.c', 'feature/equip.c',
    'mudcore/inherit/dbase.c', 'inherit/char/npc.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'inherit/item/book.c', 'inherit/item/medical-book.c', 'inherit/misc/equip.c',
])].sort();
export const taohuaLearningReviewed = '669deba2297bf381efbbe6bf89dc36f752e38dda1c67a50dbcaf74d9ebbba23a';
export const taohuaLearningFixtureRequirements = [
    'Reuse the original USER command/point observer and exact original NPC references; no direct grant, synthetic teacher, or replacement learn/study/give/recruit implementation.',
    'Four public teachers only. Snapshot no_teach learning permissions separately from body qualification, command acceptance, completed iterations and raw/effective attributes.',
    'Record real random Huang referral before resolving one of Feng/Lu/Qu; cancel only original pending apprentice. Preserve partially established family and original quest cleanup rules.',
    'Five original non-clone books only. Observe complete carrier chains, original give capacity failure retaining the teacher, actual singleton identity and original skill configuration.',
    'Study has no teacher. Extend the existing observer only for this finite no-teacher route; do not manufacture an NPC to satisfy its current guard.',
    'Record actual positive command costs, sparse gross resources, strict null/0 absence with keys present, initial learned progress, upgrade resets and all step boundaries.',
    'Keep teacher preparations/cleanup and book lookup/cleanup separate from the measured window; original NPC heartbeat may be paused, not replaced. Never alter live data.',
];
const isMartial = skill => !knowledge.has(skill) && !technic.has(skill);
const effectiveInt = s => s.properties.int + Math.trunc((s.skills.literate ?? 0) / 10)
    + (s.temp['apply/int'] ?? 0);
const effectiveForce = s => Math.trunc((s.skills.force ?? 0) / 2) + (s.skills[s.mappings.force] ?? 0);
const emptyHand = s => !s.equipment;

export function taohuaLearningAllowed(skill, s) {
    const q = s.properties, v = id => s.skills[id] ?? 0, level = v(skill), force = effectiveForce(s);
    if (skill === 'martial-cognize') return false;
    if (skill === 'bibo-shengong') return v('force') >= 10 && v('chuixiao-jifa') >= 100
        && !(q.gender === '无性' && level >= 50);
    if (skill === 'luoying-xinfa') return v('force') >= 10;
    if (skill === 'tanzhi-shentong') return q.dex >= 34 && v('force') >= 150 && q.max_neili >= 2000
        && v('finger') >= Math.max(150, level);
    if (skill === 'canglang-zhi') return emptyHand(s) && force >= 10 && v('finger') >= Math.max(10, level) && q.max_neili >= 50;
    if (skill === 'pikong-zhang') return emptyHand(s) && force >= 100 && q.max_neili >= 450 && v('strike') >= level;
    if (skill === 'luoying-shenzhang') return emptyHand(s) && force >= 80 && q.max_neili >= 400 && v('strike') >= level;
    if (skill === 'xuanfeng-tui') return emptyHand(s) && force >= 100 && q.max_neili >= 800 && v('unarmed') >= level && v('dodge') >= level;
    if (skill === 'lanhua-shou') return emptyHand(s) && force >= 150 && q.max_neili >= 1200 && v('hand') >= Math.max(100, level);
    if (skill === 'luoying-shenjian') return s.equipment?.type === 'sword' && force >= 30 && q.max_neili >= 250 && v('sword') >= level;
    if (skill === 'yuxiao-jian') return force >= 150 && q.max_neili >= 1200 && v('sword') >= Math.max(100, level);
    if (skill === 'count') return q.int >= (q.family?.family_name === '桃花岛' ? 30 : 35)
        && v('mathematics') >= Math.max(q.family?.family_name === '桃花岛' ? 200 : 300, level);
    if (skill === 'qimen-wuxing') return v('mathematics') >= Math.max(200, level);
    if (['mathematics', 'calligraphy'].includes(skill)) return v('literate') >= Math.max(100, level);
    if (skill === 'taohua-yaoli') return v('medical') >= Math.max(100, level);
    if (skill === 'chuixiao-jifa') return q.int >= 24 || effectiveInt(s) >= 35;
    if (skill === 'bihai-chaosheng') return v('chuixiao-jifa') >= Math.max(100, level);
    if (skill === 'taohua-yuan') return v('chuixiao-jifa') >= Math.max(50, level);
    assert.ok(allSkills.includes(skill), skill); return true;
}

// Exact finite support of original improve_skill, including strict upgrades and
// progress reset. This is a validation oracle, never written as a raw observation.
export function taohuaLearningProgress(s, skill, count, minInput, maxInput = minInput) {
    let states = [{ level: s.skills[skill] ?? 0, learned: s.learned[skill] ?? 0, gross: 0, upgrades: 0 }];
    const cognize = isMartial(skill) ? 'martial-cognize' : technic.has(skill) ? 'technic-cognize' : 'culture-cognize';
    for (let n = 0; n < count; n++) {
        const next = new Map();
        for (const state of states) for (let input = minInput; input <= maxInput; input++) {
            let amount = input + Math.trunc(input * (s.skills[cognize] ?? 0) / 500);
            amount = 1 + Math.trunc(amount * 100 / (state.level + 100));
            const upgraded = state.learned + amount > (state.level + 1) ** 2;
            const value = { level: state.level + Number(upgraded), learned: upgraded ? 0 : state.learned + amount,
                gross: state.gross + amount, upgrades: state.upgrades + Number(upgraded) };
            next.set(JSON.stringify(value), value);
        }
        states = [...next.values()];
    }
    return states;
}

function baseActor() {
    return { skills: { force: 600, hand: 600, finger: 600, strike: 600, unarmed: 600, dodge: 600,
        parry: 600, sword: 600, throwing: 600, literate: 400, mathematics: 400, medical: 400,
        'qimen-wuxing': 200, 'jingluo-xue': 200, 'chuixiao-jifa': 400, 'bihai-chaosheng': 200 },
    learned: {}, mappings: {}, temp: { quest: { next_level: 3 } }, properties: {
        name: '测试', class: 'scholar', title: '原有称号', gender: '男性', character: '光明磊落',
        str: 36, int: 36, con: 36, dex: 36, shen: 0, combat_exp: 100000000,
        qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
        neili: 6000, max_neili: 6000, jingli: 1000, max_jingli: 1000,
        potential: 10000, learned_points: 0, gongxian: 77, weiwang: 100,
        family: { family_name: '桃花岛', master_id: 'huang yaoshi', master_name: '黄药师',
            generation: 2, title: '传人', privs: 0, enter_time: 1000 },
        quest: { name: '实验旧任务', count: 7 }, 'reborn/family_name': 0,
        ...Object.fromEntries([...historyKeys, ...grantKeys].map(k => [k, 0])) } };
}
const learn = (key, skill, times = 1) => ({ command_kind: 'learn', teacher_key: key, skill, times,
    action: `learn ${teacher(key).id} ${skill} ${times}` });
const ask = (key, topic, extra) => ({ command_kind: 'ask', teacher_key: key, topic,
    action: `ask ${teacher(key).id} about ${topic}`, ...extra });
const study = (key, times = 1) => ({ command_kind: 'study', teacher_key: null, book: key,
    skill: bookOf(key).skill, times, action: `study ${bookOf(key).id} ${times}` });
const apprentice = key => ({ command_kind: 'apprentice', teacher_key: key,
    action: key === 'assigned' ? null : `apprentice ${teacher(key).id}`,
    ...(key === 'assigned' ? { resolve: 'observed_taohua_master', allowed_teachers: ['feng', 'lu', 'qu'] } : {}) });
const cancel = () => ({ command_kind: 'apprentice', teacher_key: null, action: 'apprentice cancel' });
const assignments = t => Object.fromEntries(t.skill_assignments.filter(s => s.function === 'create' && !s.receiver)
    .map(s => { assert.equal(s.level.kind, 'integer'); return [s.id, s.level.value]; }));

export function taohuaLearningConditions(relations, catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.equal(relations.source_fingerprint, catalog.source_fingerprint);
    const evidence = taohuaLearningSourcePaths.map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), taohuaLearningReviewed,
        '桃花学习源码改变，须重新核对');
    const levels = {}, entries = {};
    for (const t of taohuaLearningTeachers) {
        const path = t.path.slice(1) + '.c', relation = relations.objects.find(o => o.path === path);
        assert.equal(relation?.sha256, evidence.find(e => e.path === path).sha256);
        const source = readSource(path).toString(), parsed = scanSource(source);
        assert.deepEqual(parsed.lexical_issues, []);
        const fn = parsed.functions.find(f => f.name === 'create'); assert.ok(fn);
        const naming = relation.names.find(n => n.function === 'create');
        assert.equal(naming.values[0], t.name);
        assert.equal(/^\(\{\s*"([^"]+)"/.exec(naming.args[1].raw)?.[1], t.id);
        levels[t.key] = assignments(relation);
        entries[t.key] = { id: `${path}:${fn.line}:create`, path, sha256: relation.sha256,
            line: fn.line, function: 'create', role: 'teaching' };
    }
    assert.deepEqual(['huang', 'feng', 'lu', 'qu'].map(k => Object.keys(levels[k]).length), [34, 14, 16, 14]);
    assert.deepEqual([...new Set(['huang', 'feng', 'lu', 'qu'].flatMap(k => Object.keys(levels[k])))].sort(), [...allSkills].sort());
    const result = [];
    function add(kind, variant, actor, steps, extra = {}) {
        for (const id of Object.keys(actor.skills)) assert.ok(catalog.skills.some(s => s.id === id), id);
        const firstTeacher = steps.find(s => s.teacher_key && s.teacher_key !== 'assigned')?.teacher_key;
        const entry = firstTeacher ? entries[firstTeacher] : (() => {
            const path = 'cmds/skill/study.c', fn = scanSource(readSource(path).toString()).functions.find(f => f.name === 'main');
            return { id: `${path}:${fn.line}:main`, path, sha256: evidence.find(e => e.path === path).sha256,
                line: fn.line, function: 'main', role: 'teaching' };
        })();
        const p = { teaching_profile: 'taohua-learning', teaching_kind: kind, variant, actor,
            target: { skills: {}, mappings: {}, properties: {} }, topic: variant,
            teacher: firstTeacher ? { ...teacher(firstTeacher), sha256: entries[firstTeacher].sha256 } : null,
            teacher_levels: copy(levels), teaching_entry: entry, action: steps[0].action,
            teaching_expectations: copy(steps), monitored_grants: [...grantKeys],
            qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
            named_participants: true, fighting: false, observe_seconds: 0, not_applicable: '',
            book_setup: null, ...extra,
            note: '独立未注册准备。师承/技能/持书/归属为明示实验输入；原命令、资格、单例与随机保持。受理、许可、学习增长、正式拜师和领书分列；不混历史缺原件样本。' };
        const logical = initial(p), expected = [];
        for (const step of steps) {
            const decision = decide(p, step, logical, { askCost: 10, referral: 'feng' });
            expected.push(decision); applyDecision(logical, decision, decision.support?.[0]);
        }
        p.expected = expected.some(e => e.progressed || e.permission_added || e.recruited || e.acquired) ? 'observed' : 'refused';
        result.push({ id: `teaching-taohua-${kind}-${variant}`, stage: 'school', method: 'teaching',
            entry_id: entry.id, samples: smoke ? 1 : extra.samples ?? 2, status: 'configured_not_executed', parameters: p });
        delete p.samples;
    }
    function addLearn(key, skill, level, variant, edit = () => {}, extra = {}) {
        const a = baseActor(), t = teacher(key);
        a.properties.family = { ...a.properties.family, master_id: t.id, master_name: t.name, generation: t.generation + 1 };
        a.skills[skill] = level;
        if (!level) delete a.skills[skill];
        if (skill === 'luoying-shenjian') a.equipment = { type: 'sword', hold: false };
        edit(a); add('learn', `${key}-${skill}-${variant}`, a, [learn(key, skill, extra.times ?? 1)], extra);
    }
    const distribution = new Set();
    for (const key of ['huang', 'feng', 'lu', 'qu']) for (const skill of Object.keys(levels[key])) {
        const chosen = skill !== 'martial-cognize' && !distribution.has(skill);
        if (chosen) distribution.add(skill);
        addLearn(key, skill, 10, 'baseline', undefined, { samples: chosen ? 100 : 2 });
    }
    for (const [key, skill, values] of [['feng', 'canglang-zhi', [139, 140]], ['huang', 'yuxiao-jian', [199, 200]],
        ['huang', 'chuixiao-jifa', [399, 400]], ['lu', 'qimen-wuxing', [159, 160]]])
        for (const level of values) addLearn(key, skill, level, 'cap' + level);
    for (const pre of ['bihai-chaosheng', 'chuixiao-jifa'])
        addLearn('huang', 'bibo-shengong', 10, pre + '119', a => { a.skills[pre] = 119; });
    for (const pre of ['qimen-wuxing', 'jingluo-xue', 'finger', 'throwing'])
        addLearn('huang', 'tanzhi-shentong', 10, pre + '119', a => { a.skills[pre] = 119; });
    addLearn('huang', 'tanzhi-shentong', 10, 'finger120-body-refusal', a => { a.skills.finger = 120; });
    for (const [skill, pre] of [['bibo-shengong', 'bihai-chaosheng'], ['tanzhi-shentong', 'jingluo-xue']])
        addLearn('huang', skill, 10, 'pregranted', a => { a.properties['can_learn/huang/' + skill] = 1; a.skills[pre] = 0; });
    const outsider = () => { const a = baseActor(); a.properties.family = { family_name: '武当派' }; a.skills.count = 10; return a; };
    for (const value of [99, 100]) { const a = outsider(); a.skills.mathematics = value;
        add('learn', 'count-permission-math' + value, a, [ask('huang', '阴阳八卦', { permission: 'count' })]); }
    for (const value of [35, 34]) { const a = outsider(); a.skills.mathematics = 300; a.properties.int = value;
        add('learn', 'count-outsider-int' + value, a, [ask('huang', '阴阳八卦', { permission: 'count' }), learn('huang', 'count')]); }
    for (const value of [200, 201, 299, 300]) { const a = outsider(); a.skills.mathematics = value; a.properties['can_learn/huang/count'] = 1;
        add('learn', 'recognize-math' + value, a, [learn('huang', 'mathematics')]); }
    { const a = outsider(); a.skills.mathematics = 200; a.skills.finger = 10; a.properties['can_learn/huang/count'] = 1;
        add('learn', 'recognize-other-skill-math200', a, [learn('huang', 'finger')]); }
    { const a = outsider(); a.skills.mathematics = 201; add('learn', 'recognize-no-permission', a, [learn('huang', 'mathematics')]); }
    addLearn('huang', 'chuixiao-jifa', 0, 'initial');
    for (const [variant, jing, potential, times] of [['jing7', 7, 10000, 1], ['jing8', 8, 10000, 1],
        ['jing17-times3', 17, 10000, 3], ['potential2-times3', 10000, 2, 3]])
        addLearn('huang', 'literate', 100, variant, a => { a.properties.jing = jing; a.properties.potential = potential; }, { times });
    assert.equal(result.length, 110); assert.equal(distribution.size, 33);

    const recruitActor = () => { const a = baseActor(); a.properties.family = 0; a.properties.int = 24;
        a.skills = { literate: 10, force: 10 }; a.properties.combat_exp = 400000; return a; };
    const ra = (variant, edit = () => {}, steps = [apprentice('huang')]) => { const a = recruitActor(); edit(a); add('recruit', variant, a, steps); };
    ra('huang-first-repeat', undefined, [apprentice('huang'), apprentice('huang')]);
    ra('huang-transfer', a => { a.properties.family = { family_name: '桃花岛', master_id: 'qu lingfeng',
        master_name: '曲灵风', generation: 3, enter_time: 1000, title: '门人', privs: 7 }; });
    ra('huang-real-referral', a => { a.properties.combat_exp = 399999; }, [apprentice('huang'), cancel(), apprentice('assigned')]);
    for (const key of ['feng', 'lu', 'qu']) ra(key + '-assigned', a => { a.temp['taohua/master'] = teacher(key).name; }, [apprentice(key)]);
    ra('feng-wrong-assignment', a => { a.temp['taohua/master'] = teacher('qu').name; }, [apprentice('feng')]);
    ra('feng-missing-assignment', undefined, [apprentice('feng')]);
    ra('huang-already-assigned', a => { a.properties.combat_exp = 399999; a.temp['taohua/master'] = teacher('qu').name; });
    ra('huang-lower-master-low-exp', a => { a.properties.combat_exp = 399999;
        a.properties.family = { family_name: '桃花岛', master_id: 'qu lingfeng', master_name: '曲灵风', generation: 3 }; });
    ra('huang-effective-int24', a => { a.properties.int = 23; });
    for (const shen of [-10001, -10000, 10000, 10001]) ra('huang-shen' + shen, a => { a.properties.shen = shen; });
    for (const [index, key] of historyKeys.entries()) ra('huang-history' + index, a => { a.properties[key] = 1; });
    ra('foreign-confirm-refusal', a => { a.properties.family = { family_name: '武当派', master_id: 'other master',
        master_name: '前师', generation: 3 }; }, [apprentice('huang'), apprentice('huang')]);
    for (const key of ['rong', 'chen', 'mei']) ra(key + '-no-public-teaching', a => { a.skills.force = 10; },
        [apprentice(key), learn(key, 'force')]);
    assert.equal(result.length, 132);

    const bookActor = key => { const a = baseActor(), b = bookOf(key); a.skills.literate = 300;
        a.skills[b.skill] = key === 'taohua' ? 60 : key === 'luoshu' ? 200 : 100;
        if (key === 'xuanfengtui') a.properties.family.master_id = 'qu lingfeng', a.properties.family.master_name = '曲灵风';
        return a; };
    const bookAsk = key => ask(bookOf(key).count ? 'qu' : 'huang', bookOf(key).topic, { book: key });
    const countPermit = topic => ask('huang', topic, { permission: 'countbook' });
    const bookChain = key => [...(bookOf(key).count ? [countPermit(bookOf(key).topic)] : []), bookAsk(key)];
    const ba = (variant, key = 'xiaopu', edit = () => {}, steps = bookChain(key), setup = {}) => {
        const a = bookActor(key); edit(a);
        const keys = [...new Set(steps.filter(s => s.book).map(s => s.book))];
        add('books', variant, a, steps, { book_setup: { books: keys, holder: 'cold', free_capacity: 500, ...setup } });
    };
    for (const b of taohuaLearningBooks) ba(b.key + '-acquire-study', b.key, undefined,
        [...bookChain(b.key), ...(b.key === 'xiaopu' ? [bookAsk(b.key)] : []), study(b.key)]);
    for (const holder of ['peer', 'outsider', 'room', 'outsider-container']) ba('xiaopu-' + holder, 'xiaopu', undefined, [bookAsk('xiaopu')], { holder });
    ba('xiaopu-student-container', 'xiaopu', undefined, [bookAsk('xiaopu'), study('xiaopu')], { holder: 'student-container' });
    ba('xiaopu-capacity499', 'xiaopu', undefined, [bookAsk('xiaopu')], { free_capacity: 499 });
    ba('taohua-level59', 'taohua', a => { a.skills['taohua-yaoli'] = 59; });
    ba('taohua-other-master', 'taohua', a => { a.properties.family.master_name = '曲灵风'; a.properties.family.master_id = 'qu lingfeng'; });
    ba('taohua-outsider', 'taohua', a => { a.properties.family = { family_name: '武当派' }; });
    for (const level of [149, 150]) ba('xiaopu-level' + level, 'xiaopu', a => { a.skills['chuixiao-jifa'] = level; });
    ba('xuanfengtui-exp99999', 'xuanfengtui', a => { a.properties.combat_exp = 99999; });
    for (const level of [119, 120]) ba('xuanfengtui-level' + level, 'xuanfengtui', a => { a.skills['xuanfeng-tui'] = level; });
    ba('count-permission-exp999999', 'hetu', a => { a.properties.combat_exp = 999999; }, [countPermit('河图')]);
    ba('count-permission-level99', 'hetu', a => { a.skills.count = 99; }, [countPermit('河图')]);
    for (const granted of [0, 1]) ba('count-permission-outsider' + granted, 'hetu', a => {
        a.properties.family = { family_name: '武当派' }; a.properties['can_learn/huang/count'] = granted;
    }, [countPermit('河图')]);
    ba('qu-no-countbook-permission', 'hetu', undefined, [bookAsk('hetu')]);
    ba('countbook-permission-reused', 'hetu', undefined, [countPermit('河图'), bookAsk('hetu'), bookAsk('luoshu')], { free_capacity: 1000 });
    assert.equal(result.length, 157);
    const sa = (key, variant, level, edit = () => {}, times = 1) => {
        const a = bookActor(key); a.skills[bookOf(key).skill] = level; edit(a);
        if (!level) delete a.skills[bookOf(key).skill];
        add('study', key + '-' + variant, a, [study(key, times)],
            { book_setup: { books: [key], holder: 'student', free_capacity: 500 } });
    };
    for (const b of taohuaLearningBooks) for (const level of [b.max, b.max + 1]) sa(b.key, 'upper' + level, level);
    for (const b of taohuaLearningBooks.filter(b => b.min)) for (const level of [b.min - 1, b.min]) sa(b.key, 'lower' + level, level);
    for (const key of ['xiaopu', 'xuanfengtui']) sa(key, 'initial', 0);
    sa('taohua', 'medical99', 60, a => { a.skills.medical = 99; });
    for (const [raw, literate] of [[23, 110], [23, 120], [24, 1]]) sa('xiaopu', `int${raw}-literate${literate}`, 10,
        a => { a.properties.int = raw; a.skills.literate = literate; });
    sa('hetu', 'math199', 100, a => { a.skills.mathematics = 199; });
    sa('hetu', 'outsider-int34', 100, a => { a.properties.family = { family_name: '武当派' }; a.properties.int = 34; });
    sa('hetu', 'literate299', 100, a => { a.skills.literate = 299; });
    for (const [jing, times] of [[80, 1], [81, 1], [161, 3]]) sa('hetu', 'jing' + jing, 100, a => { a.properties.jing = jing; }, times);
    sa('hetu', 'clever', 100, a => { a.properties['special_skill/clever'] = 1; });
    sa('xiaopu', 'cross-book-cap', 149, a => { a.learned['chuixiao-jifa'] = 22500; }, 3);
    assert.equal(result.length, 187); assert.equal(new Set(result.map(c => c.id)).size, 187);
    assert.equal(result.reduce((n, c) => n + c.samples, 0), smoke ? 187 : 3608);
    return result;
}

function initial(p) {
    const s = copy(p.actor); s.learned ??= {}; s.temp ??= {};
    s.familyPresent = !!s.properties.family && typeof s.properties.family === 'object';
    s.pending = ''; s.pendingBetrayer = ''; s.books = {};
    for (const key of p.book_setup?.books ?? []) s.books[key] = p.book_setup.holder;
    s.freeCapacity = p.book_setup?.free_capacity ?? 0;
    return s;
}
const apprenticeOf = (s, t) => s.familyPresent && s.properties.family.master_id === t.id && s.properties.family.master_name === t.name;
const completedProgress = (s, skill, count, min, max) => ({ skill, count,
    support: taohuaLearningProgress(s, skill, count, min, max), progressed: count > 0 });

// Oracle is deliberately restricted to the frozen four-package input set.
// Random ask cost/referral and learning endpoints must come from the observed trace.
function decide(p, step, s, { askCost = 10, referral = 'feng' } = {}) {
    const q = s.properties, sk = s.skills, v = id => sk[id] ?? 0;
    const d = { accepted: 1, result: 'no_progress', jing: 0, completed: 0, permission_added: 0,
        progressed: false, recruited: false, acquired: false, updates: {} };
    const refused = (reason, accepted = 0) => ({ ...d, accepted, result: reason });
    if (step.command_kind === 'learn') {
        const t = teacher(step.teacher_key), skill = step.skill, level = v(skill), related = apprenticeOf(s, t);
        if (!related) {
            if (t.key !== 'huang') return refused('not_apprentice');
            const mat = v('mathematics');
            if (!q[grantKeys[0]] || (skill === 'mathematics' ? mat <= 200 || mat >= 300 : skill !== 'count'))
                return refused('recognize_declined', 1);
            // Only mathematics uses this recognition range. A permitted count
            // request reaches its own raw-int/mathematics valid_learn checks.
        }
        if (t.key === 'huang' && ['bibo-shengong', 'tanzhi-shentong'].includes(skill)) {
            const key = 'can_learn/huang/' + skill;
            if (!q[key]) {
                const pre = skill === 'bibo-shengong' ? ['bihai-chaosheng', 'chuixiao-jifa']
                    : ['qimen-wuxing', 'jingluo-xue', 'finger', 'throwing'];
                if (pre.some(id => v(id) < 120)) return refused('no_teach_permission', 1);
                d.updates[key] = 1; d.permission_added = 1;
            }
        }
        if (related && isMartial(skill) && level >= 200) return { ...d, result: 'martial_cap' };
        if (level >= p.teacher_levels[t.key][skill]) return { ...d, accepted: 0, result: 'teacher_cap' };
        if (!taohuaLearningAllowed(skill, s)) return { ...d, accepted: 0, result: 'body_refused' };
        if (q.potential - q.learned_points < step.times) return { ...d, accepted: 0, result: 'potential_refused' };
        if (isMartial(skill) && Math.trunc(level ** 3 / 10) > q.combat_exp) return { ...d, result: 'experience_cap' };
        const cost = Math.trunc((100 + level * 2) / q.int) * (level ? 1 : 2);
        d.completed = cost ? Math.min(step.times, Math.trunc(q.jing / cost)) : step.times;
        d.jing = d.completed < step.times ? q.jing : cost * d.completed;
        let random = Math.trunc((effectiveInt(s) + Math.trunc(level / 5)) / 2);
        if (q['special_skill/wuxing']) random += Math.trunc(random * 20 / 100);
        return { ...d, ...completedProgress(s, skill, d.completed, 4, 4 + Math.max(0, random - 1)),
            result: d.completed ? 'learned' : 'accepted_no_growth', learned_points: d.completed };
    }
    if (step.command_kind === 'study') {
        const b = bookOf(step.book), level = v(b.skill);
        if (s.books[b.key] !== 'student') return refused('book_not_directly_held');
        if (!v('literate')) return refused('illiterate');
        if (b.count && q.combat_exp < 1000000) return refused('book_exp_refused', 1);
        if (b.count && v('literate') < 300) return refused('book_need_refused');
        if (!taohuaLearningAllowed(b.skill, s)) return refused('body_refused');
        if (level > b.max || level < b.min) return refused('book_level_refused');
        if (isMartial(b.skill) && Math.trunc(level ** 3 / 10) > q.combat_exp) return refused('experience_cap');
        const cost = Math.max(10, Math.trunc((20 * b.jing + b.difficulty - effectiveInt(s)) / 20));
        d.completed = Math.min(step.times, Math.max(0, Math.trunc((q.jing - 1) / cost)));
        d.jing = d.completed < step.times ? q.jing : cost * d.completed;
        const input = Math.trunc(v('literate') / (q['special_skill/clever'] ? 5 : 10)) + 1;
        return { ...d, ...completedProgress(s, b.skill, d.completed, input),
            result: d.completed ? 'studied' : 'accepted_no_growth', learned_points: 0 };
    }
    if (step.command_kind === 'ask') {
        assert.ok(q.jing >= 30, 'Frozen ask inputs must reach the original inquiry');
        integer(askCost); assert.ok(askCost >= 10 && askCost <= 19); d.jing = askCost;
        if (step.permission === 'count') {
            if (!q[grantKeys[0]] && v('mathematics') >= 100) d.updates[grantKeys[0]] = 1, d.permission_added = 1;
            return { ...d, result: d.permission_added ? 'permission_granted' : 'permission_unchanged' };
        }
        if (step.permission === 'countbook') {
            if ((q.family?.family_name === '桃花岛' || q[grantKeys[0]]) && q.combat_exp >= 1000000 && v('count') >= 100) {
                d.countbook = 1; d.permission_added = Number(!s.temp['taohua/countbook']);
            }
            return { ...d, result: d.permission_added ? 'book_permission_granted' : 'book_permission_unchanged' };
        }
        const b = bookOf(step.book), family = q.family?.family_name;
        if (b.count ? !s.temp['taohua/countbook'] : family !== '桃花岛'
            || (b.key !== 'xuanfengtui' && q.family.master_id !== teacher('huang').id)
            || (b.key === 'taohua' && v(b.skill) < 60)
            || (b.key === 'xiaopu' && v(b.skill) >= 150)
            || (b.key === 'xuanfengtui' && (q.combat_exp < 100000 || v(b.skill) >= 120)))
            return { ...d, result: 'book_business_refused' };
        const holder = s.books[b.key];
        if (!['cold', 'teacher'].includes(holder)) return { ...d, result: holder.startsWith('student') ? 'book_already_owned' : 'book_other_owner' };
        d.book = b.key; d.book_holder = s.freeCapacity >= 500 ? 'student' : 'teacher';
        d.acquired = d.book_holder === 'student';
        return { ...d, result: d.acquired ? 'book_acquired' : 'give_capacity_refused' };
    }
    assert.equal(step.command_kind, 'apprentice');
    if (step.action === 'apprentice cancel') {
        if (!s.pending) return refused('no_pending_apprentice');
        return { ...d, result: 'cancelled', pending: '' };
    }
    const t = step.teacher_key === 'assigned'
        ? taohuaLearningTeachers.find(t => t.name === s.temp['taohua/master']) : teacher(step.teacher_key);
    assert.ok(t && t.key !== 'huang' || step.teacher_key !== 'assigned');
    if (apprenticeOf(s, t)) return { ...d, result: 'greeted' };
    const f = q.family;
    if (s.familyPresent && f.master_name && f.family_name === '桃花岛' && t.generation >= f.generation)
        return refused('generation_refused');
    if (s.familyPresent && f.family_name !== '桃花岛' && !s.pendingBetrayer)
        return { ...d, result: 'confirmation', pendingBetrayer: t.key };
    if (s.pending === t.key) return refused('already_pending');
    d.pending = t.key;
    if (['rong', 'chen', 'mei'].includes(t.key)) return { ...d, result: 'closed_teacher' };
    if (historyKeys.some(k => q[k]) || (f?.family_name && f.family_name !== '桃花岛')) return { ...d, result: 'family_refused' };
    if (t.key === 'huang') {
        if (effectiveInt(s) < 25 || q.shen < -10000 || q.shen > 10000) return { ...d, result: 'huang_attribute_refused' };
        if (q.combat_exp < 400000) {
            if (s.temp['taohua/master']) return { ...d, result: 'already_assigned' };
            if (f?.family_name === '桃花岛' && f.master_name !== '黄药师') return { ...d, result: 'lower_master_retained' };
            assert.ok(['feng', 'lu', 'qu'].includes(referral));
            return { ...d, result: 'referred', assignment: teacher(referral).name,
                family: { ...(s.familyPresent ? f : {}), family_name: '桃花岛' }, familyPresent: true };
        }
    } else if (s.temp['taohua/master'] !== t.name) return { ...d, result: 'assignment_refused' };
    return { ...d, result: s.familyPresent ? 'same_family_transfer' : 'first_join', recruited: true,
        family: { family_name: '桃花岛', master_id: t.id, master_name: t.name, generation: t.generation + 1, title: '传人', privs: 0 },
        familyPresent: true, pending: '', assignment: t.key === 'huang' ? s.temp['taohua/master'] ?? 0 : 0,
        title: `桃花岛第${t.generation === 1 ? '二' : '三'}代传人`, first: !s.familyPresent };
}

function applyDecision(s, d, endpoint) {
    s.properties.jing -= d.jing; s.properties.learned_points += d.learned_points ?? 0;
    Object.assign(s.properties, d.updates);
    if (d.countbook) s.temp['taohua/countbook'] = d.countbook;
    if (d.completed) { s.skills[d.skill] = endpoint.level; s.learned[d.skill] = endpoint.learned; }
    if (d.book) { s.books[d.book] = d.book_holder; if (d.acquired) s.freeCapacity -= 500; }
    if (Object.hasOwn(d, 'family')) s.properties.family = copy(d.family), s.familyPresent = d.familyPresent;
    if (Object.hasOwn(d, 'pending')) s.pending = d.pending;
    if (Object.hasOwn(d, 'pendingBetrayer')) s.pendingBetrayer = d.pendingBetrayer;
    if (Object.hasOwn(d, 'assignment')) s.temp['taohua/master'] = d.assignment;
    if (d.title) s.properties.title = d.title;
    if (d.first) { s.properties.gongxian = 0; s.properties.quest = 0; s.temp.quest = 0; }
}

export function taohuaLearningDecision(parameters, step, state, observations) {
    return decide(parameters, step, state, observations);
}

function validatePoint(point, s, teacherIds) {
    map(point); const q = s.properties;
    for (const [field, key] of [['contribution', 'gongxian'], ['jing', 'jing'], ['neili', 'neili'],
        ['max_neili', 'max_neili'], ['max_jingli', 'max_jingli'], ['potential', 'potential'],
        ['learned_points', 'learned_points'], ['combat_exp', 'combat_exp'], ['shen', 'shen'],
        ['weiwang', 'weiwang'], ['str', 'str'], ['int', 'int'], ['con', 'con'], ['dex', 'dex'],
        ['character', 'character']]) assert.equal(own(point, field), q[key], field);
    assert.equal(own(point, 'effective_int'), effectiveInt(s));
    assert.equal(own(point, 'effective_dex'), q.dex + Math.trunc((s.skills.dodge ?? 0) / 10));
    assert.equal(own(point, 'effective_force'), effectiveForce(s));
    assert.equal(own(point, 'effective_dodge'), Math.trunc((s.skills.dodge ?? 0) / 2)
        + (s.skills[s.mappings.dodge] ?? 0) - Number(!!s.equipment));
    for (const key of ['skills', 'learned', 'mappings']) assert.deepEqual(own(point, key), s[key], key);
    const grants = own(point, 'grants'); map(grants);
    assert.deepEqual(Object.keys(grants).sort(), [...grantKeys].sort());
    for (const key of grantKeys) assert.equal(grants[key], q[key] ?? 0, key);
    absentEqual(own(point, 'reborn_family'), q['reborn/family_name'], 'reborn_family');
    const r = own(point, 'recruitment'); map(r);
    assert.deepEqual(own(r, 'family'), s.familyPresent ? q.family : {});
    absentEqual(own(r, 'family_present'), Number(s.familyPresent), 'family mapping presence');
    for (const [field, key] of [['family', 'family_name'], ['master_id', 'master_id'], ['master_name', 'master_name']])
        absentEqual(own(point, field), q.family?.[key] ?? 0, field);
    for (const key of ['name', 'class', 'title']) assert.equal(own(r, key), q[key], 'recruitment/' + key);
    const history = own(r, 'history'); assert.deepEqual(Object.keys(history).sort(), [...historyKeys].sort());
    for (const key of historyKeys) absentEqual(own(history, key), q[key], key);
    absentEqual(own(r, 'quest'), q.quest, 'permanent quest');
    absentEqual(own(r, 'temp_quest'), s.temp.quest, 'temporary quest');
    assert.equal(own(r, 'pending_apprentice'), s.pending ? teacherIds[s.pending] : '');
    assert.equal(own(r, 'pending_betrayer'), s.pendingBetrayer ? teacherIds[s.pendingBetrayer] : '');
    const tao = own(point, 'taohua'); map(tao);
    assert.deepEqual(Object.keys(tao).sort(), ['countbook', 'master']);
    absentEqual(own(tao, 'master'), s.temp['taohua/master'] ?? 0, 'original assignment');
    absentEqual(own(tao, 'countbook'), s.temp['taohua/countbook'] ?? 0, 'original book permission');
}

function validateBookPoint(point, s, p, ids, student) {
    map(point, 'original book ownership observation'); const carriers = own(point, 'carriers'), items = own(point, 'items');
    map(carriers); assert.ok(Array.isArray(items));
    const actual = new Map();
    for (const [role, c] of Object.entries(carriers)) {
        assert.ok(['student', 'teacher', 'huang', 'qu', 'room', 'container', 'peer', 'outsider'].includes(role), 'undeclared carrier role');
        map(c); assert.equal(typeof own(c, 'object'), 'string'); assert.equal(typeof own(c, 'program'), 'string');
        assert.ok(!actual.has(c.object), 'duplicate carrier'); actual.set(c.object, c);
        assert.ok(typeof own(c, 'environment') === 'string' || zero(c.environment));
        if (['student', 'teacher', 'huang', 'qu', 'peer', 'outsider'].includes(role)) assert.equal(own(c, 'is_character'), 1);
        else assert.ok(zero(own(c, 'is_character')));
        if (['teacher', 'huang', 'qu'].includes(role)) {
            assert.ok(Object.values(ids).includes(c.object), 'carrier teacher must be one of the exact prepared NPCs');
            if (role !== 'teacher') assert.equal(c.object, ids[role]);
        }
        assert.ok(Array.isArray(own(c, 'inventory')) && c.inventory.every(x => typeof x === 'string'));
        assert.equal(new Set(c.inventory).size, c.inventory.length);
        integer(own(c, 'max_encumbrance')); own(c, 'encumbrance');
        if (role === 'room') {
            assert.equal(c.object, '/tests/runner'); assert.equal(c.program, '/tests/runner');
            assert.ok(zero(c.encumbrance), 'room weight ledger is not applicable, not actual 0 weight');
        } else integer(c.encumbrance);
    }
    assert.equal(own(carriers, 'student').object, student);
    for (const c of Object.values(carriers)) if (typeof c.environment === 'string' && c.environment) {
        const parent = actual.get(c.environment); assert.ok(parent, 'carrier environment path must be complete');
        assert.ok(parent.inventory.includes(c.object), 'carrier absent from its actual parent inventory');
    }
    assert.equal(carriers.student.max_encumbrance - carriers.student.encumbrance, s.freeCapacity,
        'remaining capacity must follow the actual original move');
    const expectedBooks = p.book_setup.books;
    assert.equal(items.length, expectedBooks.length, 'each tracked singleton lookup must be present, including absence');
    assert.deepEqual(items.map(b => b.key).sort(), [...expectedBooks].sort());
    for (const b of items) {
        const definition = bookOf(b.key), holder = s.books[b.key];
        assert.ok(own(b, 'exists') === 0 || b.exists === 1);
        if (holder === 'cold') {
            assert.equal(b.exists, 0, 'original singleton must still be absent');
            assert.equal(own(b, 'object'), ''); assert.equal(own(b, 'program'), '');
            continue;
        }
        assert.equal(b.exists, 1); assert.equal(own(b, 'object'), definition.path);
        assert.equal(own(b, 'program'), definition.path); assert.equal(own(b, 'clonep'), 0);
        assert.equal(own(b, 'id'), definition.id); assert.equal(own(b, 'weight'), 500);
        assert.ok(zero(own(b, 'amount')), 'non-combined book amount is inapplicable; count singleton identity, not this null/0');
        const config = { name: definition.skill, jing_cost: definition.jing, difficulty: definition.difficulty,
            max_skill: definition.max, min_skill: definition.min,
            ...(definition.count ? { exp_required: 1000000, need: { literate: 300 } } : {}) };
        assert.deepEqual(own(b, 'skill'), config, 'original book skill configuration');
        const role = holder === 'teacher' ? (definition.count ? 'qu' : 'huang')
            : holder.includes('container') ? 'container' : holder;
        const owner = holder.startsWith('student') ? 'student' : holder.startsWith('outsider') ? 'outsider'
            : holder === 'teacher' ? (definition.count ? 'qu' : 'huang') : holder;
        const carrier = carriers[role] ?? (holder === 'teacher' ? carriers.teacher : undefined); map(carrier, role);
        if (holder === 'teacher') assert.equal(carrier.object, ids[definition.count ? 'qu' : 'huang']);
        assert.equal(own(b, 'environment'), carrier.object);
        assert.ok(carrier.inventory.includes(b.object), 'book must occur in direct inventory');
        const chain = [], visited = new Set(); let object = b.environment;
        while (typeof object === 'string' && object) {
            assert.ok(!visited.has(object), 'cyclic ownership chain'); visited.add(object); chain.push(object);
            const c = actual.get(object); assert.ok(c, 'complete carrier path'); object = c.environment;
        }
        assert.ok(zero(object) || object === ''); assert.deepEqual(own(b, 'owner_chain'), chain);
        const ownerObject = carriers[owner]?.object ?? (holder === 'teacher' ? carrier.object : undefined);
        assert.ok(chain.includes(ownerObject), 'declared owner must match original environment chain');
        if (holder.includes('container')) assert.equal(carrier.environment, ownerObject);
        if (owner === 'peer') assert.equal(carriers.peer.family, '桃花岛');
        if (owner === 'outsider') assert.ok(typeof carriers.outsider.family === 'string' && carriers.outsider.family !== '桃花岛');
    }
}

function validateBookTransition(before, after) {
    assert.deepEqual(Object.keys(after.carriers).sort(), Object.keys(before.carriers).sort());
    const weightAt = (point, object) => point.items.filter(b => b.exists && b.owner_chain.includes(object)).length * 500;
    const direct = (point, object) => point.items.filter(b => b.exists && b.environment === object).map(b => b.object);
    for (const role of Object.keys(before.carriers)) {
        const b = before.carriers[role], a = after.carriers[role];
        assert.equal(a.object, b.object);
        assert.deepEqual({ ...a, encumbrance: b.encumbrance, inventory: b.inventory }, b, 'carrier changed beyond original move');
        if (role !== 'room') assert.equal(a.encumbrance - b.encumbrance, weightAt(after, a.object) - weightAt(before, b.object));
        const remaining = b.inventory.filter(id => !direct(before, b.object).includes(id));
        assert.deepEqual([...a.inventory].sort(), [...remaining, ...direct(after, a.object)].sort(), 'original direct inventory transfer');
    }
}

function sampleBoundary(state, point, p, student) {
    map(state); assert.equal(own(state, 'object'), student);
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(state, key), 1);
    for (const key of ['wizardp', 'ghost', 'busy']) assert.ok(zero(own(state, key)));
    for (const key of ['jing', 'neili', 'max_neili', 'potential', 'learned_points', 'str', 'int', 'con', 'dex', 'combat_exp'])
        assert.equal(own(state, key), point[key], 'sample/point linkage: ' + key);
    for (const key of ['skills', 'learned', 'mappings']) assert.deepEqual(own(state, key), point[key]);
    assert.deepEqual(own(state, 'preparations'), {});
    for (const key of ['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'jingli', 'max_jingli'])
        assert.equal(own(state, key), p.actor.properties[key]);
    const equipped = !!p.actor.equipment;
    assert.equal(own(state, 'weapon'), equipped ? 'sword' : 'none');
    assert.equal(own(state, 'weapon_damage'), equipped ? 50 : 0);
    assert.equal(own(state, 'weapon_flag'), equipped ? 4 : 0);
    assert.equal(own(state, 'handing'), 'none'); assert.deepEqual(own(state, 'handing_details'), {});
    const detail = own(state, 'weapon_details'); map(detail);
    if (equipped) {
        assert.match(own(detail, 'object'), /^\/tests\/sword#\d+$/); assert.equal(own(detail, 'program'), '/tests/sword');
        assert.equal(own(detail, 'id'), 'practice weapon'); assert.equal(own(detail, 'skill_type'), 'sword');
        assert.equal(own(detail, 'weight'), 3000); assert.equal(own(detail, 'damage'), 50); assert.equal(own(detail, 'flag'), 4);
    } else assert.deepEqual(detail, {});
    const apply = own(own(state, 'temp'), 'apply'); map(apply);
    for (const [key, expected] of [['damage', equipped ? 50 : 0], ['dodge', equipped ? -1 : 0]]) {
        if (Object.hasOwn(apply, key)) assert.ok(Number.isSafeInteger(apply[key]));
        assert.equal(apply[key] ?? 0, expected, 'actual equipment apply: ' + key);
    }
}

function preparations(raw, p) {
    const records = own(raw, 'teacher_preparations'), cleanups = own(raw, 'teacher_cleanups');
    assert.ok(Array.isArray(records) && Array.isArray(cleanups));
    const keys = new Set(p.teaching_expectations.filter(s => s.teacher_key && s.teacher_key !== 'assigned').map(s => s.teacher_key));
    if (p.teaching_expectations.some(s => s.teacher_key === 'assigned')) for (const key of ['feng', 'lu', 'qu']) keys.add(key);
    assert.equal(records.length, keys.size); assert.equal(cleanups.length, keys.size);
    const ids = {};
    for (const prep of records) {
        assert.ok(keys.has(prep.key) && !Object.hasOwn(ids, prep.key), 'unexpected/duplicate original teacher');
        const t = teacher(prep.key); assert.equal(prep.command, 'test_interface');
        assert.equal(prep.entry_actor, raw.before[0].object); assert.equal(prep.return_actor, raw.before[0].object);
        assert.equal(prep.initializer_actor, 'not_observed'); assert.equal(prep.teacher_program, t.path);
        assert.match(prep.teacher, new RegExp('^' + t.path + '#\\d+$')); ids[t.key] = prep.teacher;
        const state = own(prep, 'teacher_state'); map(state);
        assert.equal(state.object, prep.teacher); assert.equal(state.id, t.id); assert.equal(state.living, 1);
        assert.ok(zero(own(state, 'playerp'))); assert.deepEqual(own(state, 'skills'), p.teacher_levels[t.key]);
        assert.deepEqual(own(prep, 'before'), own(prep, 'after'), 'teacher construction must not mutate the student');
        for (const field of ['object', 'id', 'userp', 'playerp', 'interactive', 'skills', 'learned', 'mappings',
            'jing', 'qi', 'neili', 'max_neili', 'potential', 'learned_points'])
            assert.deepEqual(own(prep.before, field), own(raw.before[0], field), 'preparation/sample student identity');
        for (const [field, heartbeat] of [['autonomy_before', 1], ['autonomy_after', 0]]) {
            const autonomy = own(prep, field); map(autonomy);
            assert.equal(autonomy.heartbeat, heartbeat); assert.equal(autonomy.blueprint, t.path);
            assert.equal(autonomy.blueprint_heartbeat, 0); assert.deepEqual(autonomy.callbacks, []);
        }
        const cleanup = cleanups.find(c => c.object === prep.teacher); assert.ok(cleanup);
        assert.equal(cleanup.pending, 0); assert.equal(cleanup.object_exists, 0);
    }
    assert.equal(new Set(Object.values(ids)).size, keys.size);
    return ids;
}

function validateLearningPreparation(raw, p) {
    const records = own(raw, 'learning_preparations'); assert.ok(Array.isArray(records));
    const learned = p.actor.learned, keys = Object.keys(learned);
    assert.equal(records.length, keys.length, 'initial progress requires a separate original-API preparation trace');
    if (!keys.length) return;
    // The only nonempty initial progress in this finite matrix is the book-cap
    // case. Prime it through the original weak-mode API, outside the sample.
    assert.deepEqual(learned, { 'chuixiao-jifa': 22500 });
    assert.equal(p.actor.skills['chuixiao-jifa'], 149);
    const prep = records[0]; map(prep);
    assert.equal(own(prep, 'actor'), raw.before[0].object);
    assert.equal(own(prep, 'function'), 'improve_skill');
    assert.equal(own(prep, 'skill'), 'chuixiao-jifa');
    assert.equal(own(prep, 'amount'), 56023); assert.equal(own(prep, 'weak_mode'), 1);
    assert.deepEqual(own(prep, 'after'), raw.before[0], 'primed state must be the actual measurement input');
    assert.deepEqual(own(prep, 'before'), { ...raw.before[0], learned: {} },
        'original progress preparation must not alter resources, level, family or equipment');
}

export function validateTaohuaLearningRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.teaching_profile, 'taohua-learning'); assert.equal(condition.method, 'teaching');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, condition.method);
    assert.ok(['observed', 'refused'].includes(raw.outcome), 'errors are never successful learning samples');
    assert.equal(raw.outcome, p.expected);
    assert.ok(Array.isArray(raw.before) && raw.before.length === 2 && Array.isArray(raw.after) && raw.after.length === 2);
    validateLearningPreparation(raw, p);
    const steps = own(raw, 'teaching'); assert.ok(Array.isArray(steps)); assert.equal(steps.length, p.teaching_expectations.length);
    const ids = preparations(raw, p), student = raw.before[0].object;
    assert.equal(typeof student, 'string'); assert.ok(student.length);
    const s = initial(p), summaries = []; let previous, previousItems;
    for (const [index, step] of steps.entries()) {
        const instruction = p.teaching_expectations[index], before = own(step, 'before'), after = own(step, 'after');
        assert.equal(own(step, 'student'), student);
        const key = instruction.teacher_key === 'assigned'
            ? taohuaLearningTeachers.find(t => t.name === s.temp['taohua/master'])?.key : instruction.teacher_key;
        if (key) {
            assert.equal(own(step, 'teacher'), ids[key]); assert.equal(own(step, 'resolved_teacher'), ids[key]);
            assert.equal(own(step, 'teacher_program'), teacher(key).path);
            assert.deepEqual(own(step, 'teacher_skills'), p.teacher_levels[key]);
        } else {
            for (const k of ['teacher', 'resolved_teacher', 'teacher_program']) assert.equal(own(step, k), 'none', 'no fabricated study/cancel teacher');
            assert.deepEqual(own(step, 'teacher_skills'), {});
        }
        assert.equal(own(step, 'command'), instruction.action ?? `apprentice ${teacher(key).id}`);
        integer(own(step, 'command_accepted'), 'actual nonnegative command execution cost');
        assert.ok(Number.isFinite(own(step, 'elapsed')) && step.elapsed >= 0);
        integer(own(step, 'wall_time')); assert.ok(step.wall_time > 0);
        validatePoint(before, s, ids);
        if (previous) assert.deepEqual(before, previous, 'steps cannot refill resources, skills, permission or family');
        if (p.book_setup) {
            validateBookPoint(own(step, 'item_before'), s, p, ids, student);
            if (previousItems) assert.deepEqual(step.item_before, previousItems, 'no between-step book movement');
            if (instruction.command_kind === 'study')
                assert.equal(own(step, 'resolved_book'), s.books[instruction.book] === 'student' ? bookOf(instruction.book).path : '',
                    'original present(book_id, student) must resolve to this direct singleton or no object');
        }
        const askCost = instruction.command_kind === 'ask' ? before.jing - after.jing : 10;
        const referral = instruction.command_kind === 'apprentice' && key === 'huang'
            ? taohuaLearningTeachers.find(t => t.name === after.taohua?.master)?.key ?? 'feng' : 'feng';
        const d = decide(p, instruction, s, { askCost, referral });
        assert.equal(Number(step.command_accepted > 0), d.accepted, 'accepted command cost is not a boolean return');
        let matches = [];
        if (d.completed) {
            matches = d.support.filter(v => v.level === after.skills?.[d.skill] && v.learned === after.learned?.[d.skill]);
            assert.ok(matches.length > 0, 'observed progress/upgrade outside exact original support');
        }
        if (d.recruited) {
            const time = after.recruitment?.family?.enter_time;
            integer(time); assert.ok(time >= step.wall_time && time <= step.wall_time + Math.ceil(step.elapsed) + 1);
            d.family.enter_time = time;
        }
        applyDecision(s, d, matches[0]); validatePoint(after, s, ids);
        const allowedChanged = ['jing', 'skills', 'learned', 'learned_points', 'grants', 'contribution',
            'recruitment', 'family', 'master_id', 'master_name', 'taohua', 'effective_int', 'effective_force', 'effective_dodge', 'effective_dex'];
        const stableAfter = copy(after), stableBefore = copy(before);
        for (const field of allowedChanged) { delete stableAfter[field]; delete stableBefore[field]; }
        assert.deepEqual(stableAfter, stableBefore, 'unrelated point state changed');
        if (p.book_setup) {
            validateBookPoint(own(step, 'item_after'), s, p, ids, student);
            validateBookTransition(step.item_before, step.item_after);
        }
        assert.equal(step.message_scope, 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(step.messages));
        for (const message of step.messages) { assert.equal(typeof message.category, 'string'); assert.equal(typeof message.text, 'string'); }
        const gross = [...new Set(matches.map(v => v.gross))];
        summaries.push({ command_kind: instruction.command_kind, result: d.result, accepted: Number(step.command_accepted > 0),
            execution_cost: step.command_accepted, jing_cost: d.jing, completed: d.completed,
            permission_added: d.permission_added, progressed: d.progressed, recruited: d.recruited, acquired: d.acquired,
            learned_points_spent: d.learned_points ?? 0,
            skill: d.skill ?? null, upgrades: matches[0]?.upgrades ?? 0,
            learned_net: d.completed ? after.learned[d.skill] - (before.learned[d.skill] ?? 0) : 0,
            gross_learned: !d.completed ? 0 : gross.length === 1 ? gross[0] : null,
            gross_learned_status: !d.completed || gross.length === 1 ? 'determined_from_observed_endpoint' : 'not_observed_after_random_upgrade_reset',
            first_join_cleared: !!d.first, referred: d.result === 'referred', teacher_key: key ?? null,
            book: d.book ?? instruction.book ?? null });
        previous = after; previousItems = step.item_after;
    }
    for (const [boundary, point] of [[raw.before[0], steps[0].before], [raw.after[0], steps.at(-1).after]])
        sampleBoundary(boundary, point, p, student);
    assert.deepEqual(raw.after[0].weapon_details, raw.before[0].weapon_details, 'learning cannot replace/wear down equipment');
    assert.deepEqual(raw.after[0].temp.apply, raw.before[0].temp.apply, 'learning cannot add equipment bonuses');
    assert.deepEqual(raw.after[1], raw.before[1], 'unrelated USER must remain unchanged');
    assert.ok(Array.isArray(raw.metrics) && raw.metrics.length === 2);
    for (const [side, metric] of raw.metrics.entries()) {
        map(metric); for (const value of Object.values(metric)) integer(value, 'sparse metrics contain actual nonnegative integers');
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) for (const direction of ['cost', 'recovery']) {
            const total = side === 0 && resource === 'jing' && direction === 'cost'
                ? summaries.reduce((n, s) => n + s.jing_cost, 0) : 0;
            assert.equal(metric[resource + '_' + direction] ?? 0, total, 'gross resource ledger cannot hide cancelling costs');
        }
        for (const key of ['ordinary', 'hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats'])
            assert.equal(metric[key] ?? 0, 0, 'learning window contains no combat or natural tick');
    }
    for (const key of ['launches', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals']) assert.deepEqual(own(raw, key), []);
    if (p.book_setup) {
        const cleanup = own(raw, 'item_cleanup'); map(cleanup);
        assert.equal(cleanup.owned_remaining, 0);
        assert.deepEqual(cleanup.singletons, Object.fromEntries(p.book_setup.books.map(key => [bookOf(key).path, 0])));
    }
    const advanced = summaries.some(s => s.progressed || s.permission_added || s.recruited || s.acquired);
    assert.equal(raw.outcome, advanced ? 'observed' : 'refused');
    return summaries;
}

export function taohuaLearningEffects(rows, condition) {
    const summaries = rows.flatMap(row => {
        assert.equal(row.condition_id, condition.id); assert.equal(row.method, condition.method);
        assert.equal(row.outcome, row.raw.outcome); return validateTaohuaLearningRecord(row.raw, condition);
    });
    const sum = key => summaries.reduce((n, s) => n + Number(s[key]), 0);
    return { package: condition.parameters.teaching_kind, samples: rows.length, commands: summaries.length,
        commands_accepted: sum('accepted'), command_execution_cost: sum('execution_cost'),
        learned_iterations: summaries.filter(s => s.command_kind === 'learn').reduce((n, s) => n + s.completed, 0),
        studied_iterations: summaries.filter(s => s.command_kind === 'study').reduce((n, s) => n + s.completed, 0),
        progressed_commands: sum('progressed'), permission_grants: sum('permission_added'),
        formal_apprenticeships: sum('recruited'), referrals: sum('referred'), books_acquired: sum('acquired'),
        jing_cost: sum('jing_cost'), learned_points: sum('learned_points_spent'), upgrades: sum('upgrades'),
        learned_net: sum('learned_net'), unknown_gross_learned_commands: summaries.filter(s => s.gross_learned === null).length,
        known_gross_learned: summaries.filter(s => s.gross_learned !== null).reduce((n, s) => n + s.gross_learned, 0),
        results: Object.fromEntries([...new Set(summaries.map(s => s.result))].sort().map(result =>
            [result, summaries.filter(s => s.result === result).length])) };
}
