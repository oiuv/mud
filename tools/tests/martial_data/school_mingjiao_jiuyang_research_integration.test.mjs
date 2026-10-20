// Offline integration: every event/ledger fixture below is explicitly synthetic, never native evidence.
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, lstatSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { digest, createSeries, openSeries, readSamples, recordSample } from './ledger.mjs';
import { collectionInput, createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { readSchoolCombat, schoolCombatMarkdown } from './school_combat_report.mjs';
import { mingjiaoJiuyangResearchConditions, mingjiaoJiuyangResearchSourcePaths,
    mingjiaoJiuyangResearchReviewedSourceHash, validateMingjiaoJiuyangResearchCondition,
} from './school_mingjiao_jiuyang_research_cases.mjs';
import { validateMingjiaoJiuyangResearchRecord } from './school_mingjiao_jiuyang_research_observation.mjs';
import { mingjiaoJiuyangResearchReport, mingjiaoJiuyangResearchMarkdown } from './school_mingjiao_jiuyang_research_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const group = 'mingjiao-jiuyang-research', prefix = 'school-mingjiao-research-jiuyang-';
const skill = 'jiuyang-shengong', clone = value => structuredClone(value);
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const conditions = mingjiaoJiuyangResearchConditions(catalog, read);
const pick = variant => { const c = conditions.find(c => c.parameters.variant === variant); assert.ok(c); return c; };
const total = rows => rows.reduce((sum, row) => sum + row.samples, 0);
const defaultNotice = '依你目前的能力，没有办法研究这种技能。\n';
const tiredNotice = '你今天太累了，结果什么也没有研究成。\n';
const sameNotice = '你刚刚才研究过（如果你要连续研究，可以指明研究的次数）。\n';
const epoch = 1791975600;
let frozen, fixture;
const snapshot = () => frozen ??= createSandbox(root);
const temporary = [];
after(() => {
    for (const path of temporary) {
        assert.equal(dirname(path), resolve(tmpdir()));
        assert.ok(basename(path).startsWith('mud-research-integration-'));
        assert.equal(lstatSync(path).isSymbolicLink(), false);
        rmSync(path, { recursive: true });
    }
});

function state(config, side, fighting) {
    const p = config.properties, skills = config.skills;
    const s = { object: '/tests/actor#' + (side + 31), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        busy: config.busy ?? null, conditions: null, fighting_opponent: Number(fighting),
        skills: clone(skills), mappings: clone(config.mappings), preparations: clone(config.preparations), learned: {},
        temp: { user_setup: 1, apply: { armor: 100 } },
        cultivation: { sex: null, 'immune/poison': null, 'wudang-jiuyang': null, 'special_skill/divine': null },
        effective_skills: Object.fromEntries(Object.entries(skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (skills[config.mappings[key]] ?? 0)])),
        craze: 0, max_craze: 5000, force_attribute: null, age: 25,
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {},
        secondary_weapon: 'none', secondary_weapon_details: {},
        weapon_damage: 0, weapon_flag: 0, ammunition: 0 };
    for (const [key, value] of Object.entries(p)) {
        if (['name', 'race'].includes(key)) continue;
        (key.includes('/') || ['class', 'character', 'reborn', 'doing', 'breakup'].includes(key)
            ? s.cultivation : s)[key] = value;
    }
    for (const [key, basic] of [['str', 'unarmed'], ['con', 'force'], ['dex', 'dodge'], ['int', 'literate']])
        s['effective_' + key] = p[key] + Math.trunc((skills[basic] ?? 0) / 10);
    return s;
}

// Literal original-command branch anchors, not the production prediction or expected-return fields.
function firstBranch(p) {
    const a = p.actor, q = a.properties, s = a.skills, times = Number(p.action.split(' ').at(-1));
    const b = { accepted: false, completed: 0, writeoff: 0, intro: false, stamp: false, notice: '', writes: [], times };
    if (p.room.pigging) b.notice = '你还是专心拱猪吧！\n';
    else if (a.busy) b.notice = '你现在正忙着呢。\n';
    else if (p.room.no_fight && q.doing !== 'scheme') b.notice = '这里太纷杂，你没法作研究。\n';
    else if (times < 1 || times > 100) b.notice = '研究次数最少一次，最多也不能超过一百次。\n';
    else if (p.fighting) b.notice = '临阵磨枪？来不及啦。\n';
    else if (!s[skill]) b.notice = '这项技能你还不会，研究什么？\n';
    else if (s[skill] < 180) b.notice = '你对九阳神功的掌握程度还未到研究的程度。\n';
    else if (q['env/no_learn']) b.notice = '你已设置禁止学习『九阳神功』。\n';
    else if (q.potential - q.learned_points < times) b.notice = '你的潜能不够研究这么多次了。\n';
    else {
        b.intro = true;
        if (q.eff_jing < 25) b.notice = '你觉得你精力不济，实在没有办法进行研究。\n';
        else {
            b.accepted = true; b.notice = defaultNotice;
            if (Math.trunc(s[skill] ** 3 / 10) > q.combat_exp)
                b.writes.push('也许是缺乏实战经验，你感到难以继续研究九阳神功的问题了。\n');
            else {
                b.stamp = true; b.completed = Math.min(times, Math.floor(q.jing / 25));
                if (b.completed < times) b.writeoff = q.jing - b.completed * 25;
                if (!b.completed) b.writes.push(tiredNotice);
                else if (b.completed < times) b.writes.push('你觉得太累了，研究了二次后只好停下来休息。\n');
            }
        }
    }
    return b;
}

function original(c, index = 0, cost = 23, cross = false) {
    const p = c.parameters, before = [state(p.actor, 0, p.fighting), state(p.target, 1, p.fighting)];
    const raw = { kind: 'sample', condition_id: c.id, method: 'research', index, elapsed: 0.04,
        outcome: 'refused', reason: '', before, metrics: [{}, {}], command_accepted: 0,
        research_room: { no_fight: p.room.no_fight ?? null, pigging: p.room.pigging ?? null,
            research_improve: p.room.research_improve ?? null }, research_steps: [], skill_messages: [] };
    for (const key of ['actions', 'attacks', 'directs', 'passives', 'defenses', 'dodge_checks',
        'launches', 'refusals', 'interfaces', 'callbacks', 'dropped', 'terminals', 'background_stopped']) raw[key] = [];
    let states = before, metrics = [{}, {}], completed = 0;
    for (const [i, action] of p.actions.entries()) {
        const b = i === 0 ? firstBranch(p) : cross
            ? { accepted: true, completed: 0, writeoff: 0, intro: true, stamp: true,
                notice: defaultNotice, writes: [tiredNotice], times: 1 }
            : { accepted: false, completed: 0, writeoff: 0, intro: false, stamp: false,
                notice: sameNotice, writes: [], times: 1 };
        const at = epoch + Number(i > 0 && cross);
        const step = { action, entry_actor: states[0].object, return_actor: states[0].object,
            before: clone(states), metrics_before: clone(metrics), accepted: b.accepted ? cost : 0,
            reason: b.accepted ? '' : '\x1b[256D\x1b[K' + b.notice,
            wall_time_before: at, wall_time_after: at, messages: [] };
        const after = clone(states), nextMetrics = clone(metrics), jingCost = b.completed * 25 + b.writeoff;
        after[0].jing -= jingCost; after[0].learned_points += b.completed;
        after[0].temp.notify_fail = b.notice;
        if (b.stamp) after[0].temp.time = { ...(after[0].temp.time ?? {}), research: at };
        // A supported original draw of 0 gives gain1; this fixture does not claim an observed RNG input.
        if (b.completed) after[0].learned[skill] = (after[0].learned[skill] ?? 0) + b.completed;
        if (jingCost) nextMetrics[0].jing_cost = (nextMetrics[0].jing_cost ?? 0) + jingCost;
        if (b.intro) {
            step.messages.push({ side: 0, type: 'write', text: '你开始研究'
                + (b.times === 3 ? '三' : '一') + '次有关「九阳神功」的奥秘。\n' });
            step.messages.push({ side: 1, type: 'vision', text: '试侠在冥神思索。\n' });
        }
        if (b.completed) step.messages.push({ side: 0, type: 'write', text: '你研究了一会，似乎对「九阳神功」有些新的领悟。\n' });
        for (const text of b.writes) step.messages.push({ side: 0, type: 'write', text });
        step.after = after; step.metrics_after = nextMetrics;
        raw.research_steps.push(step); raw.skill_messages.push(...clone(step.messages));
        raw.command_accepted += step.accepted; completed += b.completed;
        states = after; metrics = nextMetrics;
    }
    raw.immediate = clone(states); raw.after = clone(states); raw.metrics = clone(metrics);
    raw.outcome = completed ? 'observed' : 'refused'; raw.reason = completed ? '' : states[0].temp.notify_fail;
    return raw;
}

function consumers(raw, c) {
    validateRecord(raw, c); validateSchoolCombatRecord(raw, c);
    return validateMingjiaoJiuyangResearchRecord(raw, c);
}
function denyCondition(c, edit) {
    const bad = clone(c); edit(bad);
    assert.notDeepEqual(bad, c, 'negative fixture must change the condition');
    assert.throws(() => validateMingjiaoJiuyangResearchCondition(bad));
    assert.throws(() => validateQualificationSources([bad], snapshot().files));
}
function lpcFunction(source, name) {
    const match = source.match(new RegExp(`^[\\w* ]+\\b${name}\\([^;]*?\\)\\s*\\{[\\s\\S]*?^\\}`, 'm'));
    assert.ok(match, name); return match[0];
}
function rowFor(raw, c, manifest) {
    return { format: 1, fingerprint: manifest.fingerprint, condition_id: c.id, condition_sha256: digest(c),
        index: raw.index, outcome: raw.outcome, reason: raw.reason, raw_sha256: digest(raw), raw };
}
function syntheticSeries() {
    if (fixture) return fixture;
    const directory = resolve(mkdtempSync(join(tmpdir(), 'mud-research-integration-')));
    temporary.push(directory);
    createSeries(directory, { inventory: { ...inventory, versions: { fixture: 'explicitly_synthetic' } }, catalog, conditions,
        execution: { collection: 'school-combat', smoke: false, explicitly_synthetic: true } });
    const manifest = openSeries(directory), run = join(directory, 'runs', 'attempt-synthetic');
    mkdirSync(join(run, 'mudlib', 'log'), { recursive: true });
    const records = conditions.flatMap(c => Array.from({ length: c.samples }, (_, i) => original(c, i, i % 2 ? 476 : 23)));
    const put = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    put(join(directory, 'catalog.json'), catalog);
    put(join(run, 'request.json'), { fingerprint: manifest.fingerprint,
        jobs: records.map(r => ({ condition_id: r.condition_id, index: r.index })) });
    const output = 'Explicitly synthetic offline reader fixture\nDATA COMPLETE\n';
    writeFileSync(join(run, 'driver-output.txt'), output, { flag: 'wx' });
    writeFileSync(join(run, 'mudlib', 'log', 'events.jsonl'), records.map(r => JSON.stringify(r)).join('\n') + '\n', { flag: 'wx' });
    put(join(run, 'result.json'), { interrupted: false, process: { code: 0, signal: null },
        validation_errors: [], incomplete_bytes: 0, imported: records.length, driver_output_sha256: sha256(output) });
    for (const raw of records) recordSample(directory, manifest,
        { condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, reason: raw.reason, raw });
    fixture = { directory, manifest, records, rows: readSamples(directory, manifest), report: readSchoolCombat(directory) };
    return fixture;
}

test('研究仅尾追加25；旧17391完整有序正式/烟雾指纹及分母不变', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke }).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.collection_group !== 'mingjiao-jiuyang-fusion' && c.parameters.collection_group !== 'mingjiao-remaining-perform' && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout'].includes(c.parameters.collection_group) && c.parameters.collection_group !== 'mingjiao-remaining-base');
        const tail = mingjiaoJiuyangResearchConditions(catalog, read, { smoke });
        assert.equal(all.length, 17416); assert.equal(total(all), smoke ? 29116 : 461028);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(total(all.slice(0, 17391)), smoke ? 29066 : 459900);
        assert.equal(sha256(JSON.stringify(all.slice(0, 17391))), smoke
            ? 'b3ae1f6a4a2ef342b18d62129e874dbce738983c12ffe8394bfc5d7460efdd17'
            : 'f79e7178c5d8c0bf5fdca30a2fb2ac0795fb408935b0a586cf0c469d057ae4e1');
        assert.deepEqual(all.slice(17391), tail); assert.equal(tail.length, 25);
        assert.equal(total(tail), smoke ? 50 : 1128);
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? '070c377d67953314d5deea12baa087aa8c048cc8cad883402a7c19a00f751d92'
            : 'd18d2537fd10b81a74b8c49f25af927896edadc0404d55a1696646169ba8ec79');
        for (const c of tail) {
            assert.ok(c.id.startsWith(prefix)); assert.equal(c.parameters.collection_group, group);
            assert.equal(c.entry_id, 'kungfu/skill/jiuyang-shengong.c'); assert.equal(c.method, 'research');
            assert.equal(c.parameters.run_mode, smoke ? 'smoke' : 'formal');
            assert.equal(c.status, 'prepared_not_sampled'); validateMingjiaoJiuyangResearchCondition(c);
        }
    }
});

test('139资格来源与原research命令入口严格绑定；缺源漂移/改计划不能执行', () => {
    const files = snapshot().files;
    assert.equal(mingjiaoJiuyangResearchSourcePaths.length, 139);
    assert.equal(mingjiaoJiuyangResearchReviewedSourceHash,
        'a5b3c385cafed6781b4f83faef0205d6c1c7187f111db8502d61eb74afb464fe');
    validateQualificationSources(conditions, files);
    for (const path of mingjiaoJiuyangResearchSourcePaths) {
        assert.equal(files[path], conditions[0].parameters.source_evidence[path], path);
        for (const missing of [false, true]) {
            const changed = { ...files };
            if (missing) delete changed[path]; else changed[path] = '0'.repeat(64);
            assert.throws(() => validateQualificationSources([conditions[0]], changed), path);
        }
    }
    for (const edit of [
        c => { c.entry_id += ':13:main'; }, c => { c.method = 'interface'; },
        c => { c.parameters.qualification_sources.pop(); }, c => { c.parameters.reviewed_source_hash = '0'.repeat(64); },
        c => { c.parameters.research_source_entry.line++; }, c => { c.parameters.action = 'research force 1'; },
        c => { c.parameters.actions.push(c.parameters.action); }, c => { c.parameters.actor.skills.force++; },
        c => { c.parameters.actor.properties.reborn = {}; }, c => { c.parameters.actor.equipment = { type: 'sword' }; },
        c => { c.parameters.actor.temp = { time: { research: epoch } }; }, c => { c.parameters.observe_seconds = 1; },
        c => { c.parameters.room.research_improve = 51; }, c => { c.parameters.run_mode = 'smoke'; },
    ]) denyCondition(conditions[0], edit);
    for (const smoke of [false, true]) {
        const plans = mingjiaoJiuyangResearchConditions(catalog, read, { smoke });
        const jobs = plans.flatMap(c => Array.from({ length: c.samples }, (_, index) =>
            ({ condition_id: c.id, method: c.method, index, parameters: c.parameters })));
        const input = collectionInput(jobs);
        assert.equal(input.connections, 2); assert.equal(input.bytes, Buffer.byteLength(input.text, 'utf8'));
        assert.deepEqual(JSON.parse(input.text).jobs, jobs);
    }
});

test('六准备工具+本集成全部冻结；原15文件48探针逐位点真逆还原且原SHA不变', () => {
    const { files, probes: allProbes } = snapshot();
    const fusion = allProbes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = allProbes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    for (const suffix of ['cases.mjs', 'cases.test.mjs', 'observation.mjs', 'observation.test.mjs',
        'report.mjs', 'report.test.mjs', 'integration.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_jiuyang_research_' + suffix;
        assert.equal(files[path], sha256(readFileSync(join(root, path))), path);
    }
    assert.equal(probes.length, 15); assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(probes)), 'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    for (const probe of probes) {
        const source = read(probe.path);
        assert.equal(sha256(source), probe.before); assert.equal(files[probe.path], probe.before);
        const replacements = probe.sites.map(site => Array.isArray(site) ? [site[0], site[1] + site[0]]
            : Object.hasOwn(site, 'replacement') ? [site.anchor, site.replacement]
                : [site.anchor, site.position === 'before' ? site.insert + site.anchor : site.anchor + site.insert]);
        let instrumented = source;
        for (const [before, after] of replacements) {
            assert.equal(instrumented.split(before).length, 2); instrumented = instrumented.replace(before, after);
        }
        assert.equal(sha256(instrumented), probe.after);
        for (const [before, after] of replacements.toReversed()) {
            assert.equal(instrumented.split(after).length, 2); instrumented = instrumented.replace(after, before);
        }
        assert.equal(instrumented, source);
    }
});

test('25独立合成原件经三消费者：实际正成本、SET尾数、零进展与跨秒不冒完成', () => {
    for (const c of conditions) for (const cost of [1, 23, 476]) {
        const raw = original(c, 0, cost), saved = clone(raw), v = consumers(raw, c);
        assert.equal(v.command_cost, raw.command_accepted); assert.ok(v.condition_matched);
        assert.deepEqual(raw, saved);
    }
    const partial = consumers(original(pick('jing51-times3')), pick('jing51-times3'));
    assert.equal(partial.completed, 2); assert.equal(partial.normal_jing_fee, 50);
    assert.equal(partial.jing_writeoff, 1); assert.equal(partial.jing_cost, 51); assert.equal(partial.learned_net, 2);
    const zero = consumers(original(pick('jing24'), 0, 476), pick('jing24'));
    assert.equal(zero.commands_accepted, 1); assert.equal(zero.command_cost, 476);
    assert.equal(zero.completed, 0); assert.equal(zero.jing_writeoff, 24);
    const cross = consumers(original(pick('same-second-jing24'), 0, 23, true), pick('same-second-jing24'));
    assert.equal(cross.commands_accepted, 2); assert.equal(cross.command_cost, 46);
    assert.equal(cross.condition_matched, false); assert.equal(cross.same_second_status, 'not_met');
    assert.deepEqual(cross.same_second, { trials: null, refused: null });
    const c = pick('level200');
    for (const edit of [
        r => { r.research_steps[0].accepted = 0; r.command_accepted = 0; },
        r => { r.research_steps[0].accepted = 1.5; r.command_accepted = 1.5; },
        r => { delete r.research_steps[0].wall_time_before; }, r => { r.research_steps[0].return_actor = r.before[1].object; },
        r => { r.research_steps[0].messages = []; }, r => { r.research_steps[0].metrics_after[0].jing_cost = 24; },
        r => { r.after[0].learned_points++; }, r => { r.after[1].neili--; },
        r => { r.before[0].secondary_weapon = 'sword'; }, r => { delete r.before[0].conditions; },
        r => { r.research_room.research_improve = 50; }, r => { r.random_draws = [0]; },
    ]) {
        const raw = original(c), bad = clone(raw); edit(bad); assert.notDeepEqual(bad, raw);
        assert.throws(() => validateSchoolCombatRecord(bad, c));
        assert.throws(() => validateMingjiaoJiuyangResearchRecord(bad, c));
    }
    const error = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        outcome: 'error', elapsed: 0.1, reason: 'explicit synthetic diagnostic, not measured zero' };
    assert.equal(consumers(error, c), null);
    for (const edit of [r => { r.reason = ''; }, r => { r.elapsed = -1; }, r => { delete r.index; }]) {
        const bad = clone(error); edit(bad); assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
});

test('完整1128合成request/raw/ledger走真实reader，Report传原condition/manifest并独立核分账', () => {
    const { manifest, report, rows, directory } = syntheticSeries();
    assert.deepEqual(openSeries(directory), manifest); assert.equal(rows.length, 1128);
    assert.equal(report.conditions.length, 25); assert.equal(report.smoke, false);
    const sums = { commands: 0, commands_accepted: 0, commands_refused: 0, completed: 0,
        normal_jing_fee: 0, jing_writeoff: 0, jing_cost: 0, learned_net: 0 };
    for (const c of conditions) {
        const actual = report.conditions.find(item => item.id === c.id);
        const expected = mingjiaoJiuyangResearchReport(rows.filter(r => r.condition_id === c.id), c, manifest);
        assert.equal(actual.effects, null); assert.equal(actual.sides, null);
        assert.deepEqual(actual.mingjiao_jiuyang_research, expected); assert.equal(expected.coverage.complete, true);
        for (const key of Object.keys(sums)) sums[key] += expected.effects.known[key];
    }
    assert.equal(rows.filter(r => r.outcome === 'observed').length, 1100);
    assert.equal(rows.filter(r => r.outcome === 'refused').length, 28);
    assert.deepEqual(sums, { commands: 1130, commands_accepted: 1106, commands_refused: 24, completed: 1200,
        normal_jing_fee: 30000, jing_writeoff: 196, jing_cost: 30196, learned_net: 1200 });
    const markdown = schoolCombatMarkdown(report, manifest, rows);
    for (const c of report.conditions) assert.ok(markdown.includes(mingjiaoJiuyangResearchMarkdown(
        c.mingjiao_jiuyang_research, manifest, rows.filter(r => r.condition_id === c.id))));
    assert.ok(!markdown.slice(0, markdown.indexOf('### 九阳研究')).includes(prefix));
    assert.throws(() => schoolCombatMarkdown(report));
    assert.throws(() => schoolCombatMarkdown(report, manifest));
    const altered = clone(report); altered.conditions[0].mingjiao_jiuyang_research.effects.known.completed++;
    assert.throws(() => schoolCombatMarkdown(altered, manifest, rows));
    const legacy = { ...report, conditions: [] };
    assert.equal(schoolCombatMarkdown(legacy), schoolCombatMarkdown(legacy, manifest, rows));
});

test('缺件/诊断/跨秒为未知或未匹配；重签哈希不能将缩样本或smoke冒formal', () => {
    const { manifest, rows } = syntheticSeries(), c = pick('level200');
    assert.equal(mingjiaoJiuyangResearchReport([], c, manifest).effects.known, null);
    assert.equal(mingjiaoJiuyangResearchReport([], c, manifest).coverage.missing, 100);
    const one = rows.filter(r => r.condition_id === c.id).slice(0, 1);
    assert.equal(mingjiaoJiuyangResearchReport(one, c, manifest).effects.complete_plan, null);
    for (const outcome of ['error', 'not_applicable']) {
        const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
            outcome, elapsed: 0.1, reason: 'explicit synthetic unavailable result' };
        const r = mingjiaoJiuyangResearchReport([rowFor(raw, c, manifest)], c, manifest);
        assert.equal(r.coverage.unknown, 1); assert.equal(r.effects.known, null);
        assert.equal(r.effects.complete_plan, null);
    }
    const same = pick('same-second-jing24');
    const crossRows = [0, 1].map(i => rowFor(original(same, i, 23, true), same, manifest));
    const unmatched = mingjiaoJiuyangResearchReport(crossRows, same, manifest);
    assert.equal(unmatched.coverage.missing, 0); assert.equal(unmatched.coverage.unmatched, 2);
    assert.equal(unmatched.coverage.complete, false); assert.equal(unmatched.effects.complete_plan, null);
    assert.equal(unmatched.effects.known.command_cost, 92); assert.equal(unmatched.effects.matched_known, null);
    for (const condition of [c, pick('jing24')]) {
        const bad = clone(condition); bad.parameters.run_mode = 'smoke'; bad.samples = 2;
        validateMingjiaoJiuyangResearchCondition(bad); // Individually valid smoke plan is still not this formal series.
        const resealed = clone(manifest);
        resealed.identity.conditions = resealed.identity.conditions.map(x => x.id === bad.id ? bad : x);
        resealed.fingerprint = digest(resealed.identity);
        const badRows = [0, 1].map(i => rowFor(original(bad, i), bad, resealed));
        assert.throws(() => mingjiaoJiuyangResearchReport(badRows, bad, resealed), /run mode/);
    }
    const shortened = clone(c); shortened.samples = 2;
    assert.throws(() => validateMingjiaoJiuyangResearchCondition(shortened));
    const flipped = clone(manifest); flipped.identity.execution.smoke = true; flipped.fingerprint = digest(flipped.identity);
    assert.throws(() => mingjiaoJiuyangResearchReport([], c, flipped), /run mode/);
    assert.throws(() => mingjiaoJiuyangResearchReport([one[0], one[0]], c, manifest));
});

test('shared CLI传opened manifest和readSamples原rows，完整JSON/MD一致且严格拒绝smoke', () => {
    const { directory, report, manifest, rows } = syntheticSeries(), output = join(directory, 'synthetic-report');
    const before = readSamples(directory, manifest);
    const child = spawnSync(process.execPath, [join(root, 'tools/tests/martial_data/school_combat_report.mjs'),
        directory, output], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.equal(child.error, undefined); assert.equal(child.signal, null);
    assert.equal(child.status, 0, child.stderr + child.stdout);
    assert.deepEqual(JSON.parse(readFileSync(join(output, 'school-combat.json'), 'utf8')), report);
    assert.equal(readFileSync(join(output, 'school-combat.md'), 'utf8'), schoolCombatMarkdown(report, manifest, rows));
    assert.deepEqual(readSamples(directory, manifest), before);
    const smokeDirectory = join(directory, 'synthetic-smoke');
    createSeries(smokeDirectory, { inventory, catalog, conditions: mingjiaoJiuyangResearchConditions(catalog, read, { smoke: true }),
        execution: { collection: 'school-combat', smoke: true, explicitly_synthetic: true } });
    assert.throws(() => readSchoolCombat(smokeDirectory), /烟雾不是完整统计/);
});

test('runner只经真实research命令，12字段逐步实值/原time/累计费用，无代入预期或新RNG', () => {
    const source = read('tools/tests/martial_data/runner.lpc'), perform = lpcFunction(source, 'perform_sample');
    const start = perform.indexOf('if (parameters["collection_group"] == "mingjiao-jiuyang-research")');
    assert.ok(start >= 0);
    const research = perform.slice(start, perform.indexOf('if (action == "ordinary")', start));
    assert.match(research, /current\["method"\] == "research"/);
    assert.match(research, /parameters\["observe_seconds"\] == 0/);
    assert.match(research, /function_exists\("force_me", players\[0\]\) == "\/feature\/command"/);
    assert.match(research, /players\[0\]->find_command\("research"\) == "\/cmds\/skill\/research\.c"/);
    assert.match(research, /step\["wall_time_before"\] = time\(\);\s*result = players\[0\]->force_me\(action\);\s*step\["wall_time_after"\] = time\(\)/);
    assert.equal((research.match(/players\[0\]->force_me\(action\)/g) ?? []).length, 1);
    for (const key of ['action', 'entry_actor', 'return_actor', 'before', 'after', 'metrics_before', 'metrics_after',
        'accepted', 'reason', 'wall_time_before', 'wall_time_after', 'messages']) assert.ok(research.includes('"' + key + '"'));
    assert.match(research, /step\["return_actor"\] == step\["entry_actor"\]/);
    assert.match(research, /step\["accepted"\] = result/);
    assert.match(research, /current\["command_accepted"\] \+= result/);
    assert.match(research, /players\[0\]->query_temp\("notify_fail"\)/);
    assert.match(research, /current\["skill_messages"\]\[launches\.\.\]/);
    assert.match(research, /players\[0\]->query\("learned_points"\) >\s*current\["before"\]\[0\]\["learned_points"\]/);
    assert.doesNotMatch(research, /random\(|call_out\(|query_action\(|->set\(|->set_temp\(|start_observation\(|reset_observation\(/);
    const snap = lpcFunction(source, 'snapshot');
    assert.match(snap, /\(\{ "mingjiao-jiuyang-learning", "mingjiao-jiuyang-capacity",\s*"mingjiao-jiuyang-research" \}\)/);
    assert.match(snap, /secondary = ob->query_temp\("secondary_weapon"\)/);
    assert.match(snap, /result\["secondary_weapon_details"\] = equipment_snapshot\(secondary\)/);
    const messages = lpcFunction(source, 'observe_lookup_message');
    assert.ok(messages.includes('"mingjiao-jiuyang-research"')); assert.match(messages, /member_array\(me, players\)/);
    for (const key of ['no_fight', 'pigging', 'research_improve'])
        assert.ok(source.includes('"' + key + '": query("' + key + '")'));
    const observation = lpcFunction(source, 'advance');
    assert.ok(observation.includes('"mingjiao-jiuyang-research"'));
    assert.match(observation, /current\["skill_messages"\] = \(\{\}\)/);
});
