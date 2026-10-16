import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skillMusicLearnConditions, skillMusicConditions, skillMusicInstruments,
    skillMusicSongs, skillMusicSourcePaths, validateSkillMusicRecord, skillMusicEffects,
    checkSkillMusicEffect } from './skill_music_cases.mjs';
import { scanSource } from './inventory.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value)
    ? value : JSON.stringify(value)).digest('hex');

const songIds = Object.keys(skillMusicSongs);
const catalog = { skills: songIds.map(song => {
    const skill = skillMusicSongs[song].skill, path = 'kungfu/skill/' + skill + '.c';
    const source = read(path).toString('utf8'), parsed = scanSource(source);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id: skill, path, sha256: hash(read(path)), entries: parsed.functions
        .filter(fn => ['valid_learn', 'do_effect'].includes(fn.name))
        .map(fn => ({ id: path + ':' + fn.line + ':' + fn.name, role: fn.name })) };
}) };

const learn = skillMusicLearnConditions(catalog, read);
const music = skillMusicConditions(catalog, read);
const smoke = skillMusicConditions(catalog, read, { smoke: true });

test('old conditions retained; two exact combined-level boundaries extend formal plan to 4010 / smoke 149', () => {
    assert.equal(learn.length, 55);
    assert.equal(learn.reduce((n, c) => n + c.samples, 0), 110);
    assert.equal(music.length, 39);
    assert.equal(music.reduce((n, c) => n + c.samples, 0), 3900);
    assert.ok(music.every(c => c.samples === 100));
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 39);
    // Legacy f5 used higher raw skills for these three positive conditions;
    // its immutable input is reproducible, but is not the corrected boundary matrix.
    const legacyLearn = structuredClone(learn);
    for (const c of legacyLearn) {
        if (c.id === 'skill-music-qixian-learn-unarmed180') c.parameters.actor.skills.unarmed = 540;
        if (c.id === 'skill-music-qixian-learn-sword180') c.parameters.actor.skills.sword = 540;
        if (c.id === 'skill-music-qixian-learn-tanqin100') c.parameters.actor.skills['tanqin-jifa'] = 180;
    }
    assert.equal(hash(legacyLearn), '34f9263d06bad20b2d86f7a2138086dc83ab1657e6fba2bf98bad04f03a2b012');
    assert.equal(hash(learn), 'd4bc76811ae668da59248b01490c683f2c14304a69d7aa7e79cba2c319b02afe');
    assert.notEqual(hash(learn), hash(legacyLearn));
    for (const [variant, key, value] of [['unarmed180', 'unarmed', 180],
        ['sword180', 'sword', 180], ['tanqin100', 'tanqin-jifa', 100]]) {
        const c = learn.find(c => c.id === 'skill-music-qixian-learn-' + variant);
        assert.equal(c.parameters.actor.skills[key], value);
    }
    // The old two-sample series stays immutable; only the new formal count changes.
    assert.equal(hash(music.filter(c => !c.parameters.variant.startsWith('edge-effective')).map(c => ({ ...c, samples: 2 }))),
        '6f78125f047564d2b8e5d66d7ce3b6ded46616269a2840816519d57d23b6fe3b');
    assert.equal(hash(smoke.filter(c => !c.parameters.variant.startsWith('edge-effective'))),
        'c1b3e727494347e446bd85c7e5491b3bc7df9337922e5608a9054f9c6b4e594e');
    const ids = [...learn, ...music].map(c => c.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const c of learn) assert.equal(c.method, 'interface');
    for (const c of music) assert.equal(c.method, 'music');
});

test('sample count applies to every play variant; smoke remains independent', () => {
    assert.ok(skillMusicConditions(catalog, read, { samples: 7 }).every(c => c.samples === 7));
    assert.ok(skillMusicConditions(catalog, read, { smoke: true, samples: 7 }).every(c => c.samples === 1));
    for (const samples of [0, -1, 1.5, NaN])
        assert.throws(() => skillMusicConditions(catalog, read, { samples }));
});

test('sources and entries pinned; misspelled keys never created', () => {
    assert.equal(skillMusicSourcePaths.length, 48);
    for (const path of skillMusicSourcePaths) assert.ok(read(path).length > 0, path);
    for (const c of [...learn, ...music]) {
        assert.ok(c.entry_id.startsWith('kungfu/skill/'), c.id);
        for (const [path, sha] of Object.entries(c.parameters.source_evidence))
            assert.equal(sha, hash(read(path)), path);
        assert.equal(c.parameters.not_applicable, '');
        assert.equal(c.parameters.observation, 'single_action_immediate');
    }
    for (const c of learn) {
        for (const key of ['cuhixiao-jifa', 'jianjia', 'xuan-huntun'])
            assert.equal(c.parameters.actor.skills[key], undefined, c.id);
    }
});

function listener(object, props = {}) {
    return { object, id: object.endsWith('#101') ? 'right' : 'third', userp: 1, playerp: 1,
        interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null,
        jing: 1000, eff_jing: 1000, max_jing: 10000, qi: 1000, eff_qi: 1000, max_qi: 10000,
        neili: 3000, max_neili: 6000, skills: { force: 2 }, ...props,
        temp: { user_setup: 1, apply: { armor: 100 } } };
}

test('learn synthetic records validate; state change and misspelled keys rejected', () => {
    for (const c of learn) {
        const p = c.parameters, observed = p.expected === 'observed';
        const splitProps = props => {
            const top = {}, cultivation = {};
            for (const [k, v] of Object.entries(props)) (k.includes('/') || k === 'character' ? cultivation : top)[k] = v;
            return { top, cultivation };
        };
        const a = splitProps(p.actor.properties);
        const actor = { object: '/tests/actor#100', userp: 1, playerp: 1, interactive: 1, living: 1,
            wizardp: 0, ghost: 0, weapon: 'none', busy: null,
            skills: { ...p.actor.skills }, ...a.top, cultivation: { ...a.cultivation },
            temp: { user_setup: 1, apply: { armor: 100 } } };
        const b = splitProps(p.target.properties);
        const peer = { object: '/tests/actor#101', userp: 1, playerp: 1, interactive: 1, living: 1,
            wizardp: 0, ghost: 0, weapon: 'none', busy: null, skills: {}, ...b.top,
            cultivation: { ...b.cultivation }, temp: { user_setup: 1, apply: { armor: 100 } } };
        const raw = { kind: 'sample', condition_id: c.id, method: 'interface', outcome: p.expected,
            interfaces: [{ ...p.interface, result: observed ? 1 : 0 }], metrics: [{}, {}],
            before: [actor, peer], immediate: null, after: null,
            reason: observed ? '' : (p.expected_reason || 'refused') };
        raw.immediate = JSON.parse(JSON.stringify(raw.before));
        raw.after = JSON.parse(JSON.stringify(raw.before));
        if (!observed) raw.immediate[0].temp.notify_fail = p.expected_reason || 'refused';
        validateSkillMusicRecord(raw, c);
        const rows = [raw, { ...raw, outcome: 'error' }, { ...raw, outcome: 'not_applicable' }]
            .map(r => ({ condition_id: c.id, outcome: r.outcome, raw: r }));
        const report = skillMusicEffects(rows, c);
        assert.equal(report.acceptance.successes, observed ? 1 : 0);
        assert.equal(report.acceptance.trials, 1, 'errors and not-applicable are not accepted trials');
        assert.equal(report.refusal.successes, observed ? 0 : 1);
        assert.equal(report.refusal.trials, 1);
        assert.equal(report.counts.error, 1); assert.equal(report.counts.not_applicable, 1);
        const unknown = skillMusicEffects(rows.slice(1), c);
        assert.equal(unknown.acceptance.trials, 0); assert.equal(unknown.acceptance.rate, null);
        const missingResult = structuredClone(raw);
        delete missingResult.interfaces[0].result;
        assert.throws(() => skillMusicEffects([{ condition_id: c.id, outcome: raw.outcome, raw: missingResult }], c),
            'missing original interface result must not become a zero');
        const broken = JSON.parse(JSON.stringify(raw));
        broken.after[0].jing = 1;
        assert.throws(() => validateSkillMusicRecord(broken, c));
        const wrongKey = JSON.parse(JSON.stringify(raw));
        wrongKey.before[0].skills['cuhixiao-jifa'] = 100;
        assert.throws(() => validateSkillMusicRecord(wrongKey, c));
        const legacySkill = {
            'skill-music-qixian-learn-unarmed180': ['unarmed', 540],
            'skill-music-qixian-learn-sword180': ['sword', 540],
            'skill-music-qixian-learn-tanqin100': ['tanqin-jifa', 180],
        }[c.id];
        if (legacySkill) {
            const legacy = structuredClone(raw);
            for (const states of [legacy.before, legacy.immediate, legacy.after])
                states[0].skills[legacySkill[0]] = legacySkill[1];
            assert.throws(() => validateSkillMusicRecord(legacy, c),
                'Legacy higher-skill record is not evidence for the new exact boundary');
        }
    }
});

function musicRaw(c, mutate = null) {
    const p = c.parameters, eff = p.effect;
    const instrument = { object: p.instrument.program + '#1', program: p.instrument.program,
        input_id: p.instrument.input_id, play_owner: '/inherit/misc/' + p.instrument.play_fn.replace('play_', '_') };
    const before = [
        { ...listener('/tests/actor#100'), id: 'left', skills: { ...p.actor.skills }, ...p.actor.properties },
        listener('/tests/actor#101', p.target.properties),
        listener('/tests/actor#102', p.extra_target.properties)];
    const after = JSON.parse(JSON.stringify(before));
    const messages = [{ side: 0, type: 'vision', text: 'performer message 慷慨激昂' },
        { side: 1, type: 'vision', text: 'listener message' },
        { side: 2, type: 'vision', text: eff.love ? 'listener 伊人 message' : 'third message' }];
    if (eff.kind === 'heal') {
        for (let i = 1; i <= 2; i++) {
            const key = eff.formula === 'jing' ? 'max_jing' : 'max_qi';
            after[i][eff.formula] = Math.min(before[i][eff.formula] + 55, before[i][key]);
        }
    } else if (eff.kind === 'hostile' && eff.branch === 'damage') {
        for (let i = 1; i <= 2; i++) {
            const d = Math.trunc((before[0].max_neili - before[i].max_neili) / 10);
            const pair = eff.formula === 'tieqin' ? [Math.trunc(d * 2 / 3), Math.trunc(d * 2 / 9)]
                : eff.formula === 'xiyu' ? [d, Math.trunc(d / 3)] : [Math.trunc(d / 2), Math.trunc(d / 2)];
            after[i].jing = before[i].jing - pair[0]; after[i].eff_jing = before[i].eff_jing - pair[1];
            if (eff.formula === 'qixian') {
                after[i].qi = before[i].qi - d * 2;
                after[i].eff_qi = before[i].eff_qi - d * 2;
            }
        }
    } else if (eff.kind === 'wushe-neili' && eff.branch === 'zero') {
        after[0].neili = 0;
    } else if (eff.kind === 'wushe-neili') {
        after[0].neili = before[0].neili - 25;
    } else if (eff.kind === 'wushe-boundary') {
        messages[0].text = eff.branch === 'below50' ? '你满头大汗的弹了半天，好像没有什么作用。'
            : '你弹了半天，但是没有一条蛇出来。';
        if (eff.branch === 'at50') after[0].neili = before[0].neili - 25;
    } else if (eff.kind === 'xiaoao-solo') {
        for (let i = 1; i <= 2; i++) after[i].temp = { ...after[i].temp, xajh: { qin: 100 } };
    }
    after[0].busy = 4;
    const room = { object: '/tests/runner', no_fight: p.room.no_fight ?? null, skybook: p.room.skybook ?? null };
    const inventory = [before[0].object, before[1].object, before[2].object]
        .concat(eff.kind === 'wushe-neili' && eff.branch === 'snake' ? ['/clone/beast/caihuashe#7'] : []);
    const raw = { kind: 'sample', condition_id: c.id, method: 'music', outcome: p.expected,
        before, immediate: JSON.parse(JSON.stringify(after)), after: JSON.parse(JSON.stringify(after)),
        extra_target_before: JSON.parse(JSON.stringify(before[2])),
        extra_target_immediate: JSON.parse(JSON.stringify(after[2])),
        extra_target_after: JSON.parse(JSON.stringify(after[2])),
        music_steps: [{ action: p.action, accepted: 1, reason: '', messages,
            before: JSON.parse(JSON.stringify(before)), after: JSON.parse(JSON.stringify(after)) }],
        command_accepted: 1, reason: '',
        music_preparation: { action: p.instrument.preparation_action, actor: before[0].object, accepted: 1,
            before: { actor: JSON.parse(JSON.stringify(before[0])), instrument: { ...instrument } },
            after: { actor: JSON.parse(JSON.stringify(after[0])), instrument: { ...instrument } } },
        music_context_before: { room: { ...room }, instrument: { ...instrument }, inventory: [...inventory] },
        music_context_after: { room: { ...room }, instrument: { ...instrument }, inventory: [...inventory] } };
    if (mutate) mutate(raw);
    return raw;
}

test('music synthetic records cover every effect branch; tampering rejected', () => {
    for (const c of music) {
        const raw = musicRaw(c);
        validateSkillMusicRecord(raw, c);
        const report = skillMusicEffects([{ condition_id: c.id, index: 0, outcome: c.parameters.expected, raw }], c);
        assert.equal(report.effect_kind, c.parameters.effect.kind);
        assert.equal(report.counts[c.parameters.expected], 1);
        const tampered = musicRaw(c, r => { r.music_steps[0].accepted = 0; });
        assert.throws(() => validateSkillMusicRecord(tampered, c));
    }
});

test('effect checker: shared random mismatch, forged snake and wrong branch rejected', () => {
    const c = music.find(x => x.id === 'skill-music-guangsan-heal-baseline');
    const bad = musicRaw(c, r => { r.immediate[1].jing += 1; r.after[1].jing += 1; r.music_steps[0].after[1].jing += 1; });
    assert.throws(() => validateSkillMusicRecord(bad, c), 'shared random mismatch must reject');
    const snake = music.find(x => x.id === 'skill-music-wushe-snake');
    const forged = musicRaw(snake, r => {
        r.music_context_after.inventory = r.music_context_after.inventory.filter(n => !n.includes('/clone/beast/'));
    });
    assert.throws(() => validateSkillMusicRecord(forged, c ? snake : snake), 'forged snake must reject');
    const silent = music.find(x => x.id === 'skill-music-tieqin-nofight');
    const moved = musicRaw(silent, r => { r.immediate[1].jing -= 1; r.after[1].jing -= 1; r.music_steps[0].after[1].jing -= 1; });
    assert.throws(() => validateSkillMusicRecord(moved, silent), 'silent branch state change must reject');
});

test('healing cannot be zero or below the original minimum, including capped listeners', () => {
    for (const c of music.filter(c => c.parameters.effect.kind === 'heal')) {
        const key = c.parameters.effect.formula;
        for (const side of [1, 2]) {
            const raw = musicRaw(c);
            const start = side === 1 ? raw.before[1] : raw.extra_target_before;
            const headroom = start[key === 'jing' ? 'max_jing' : 'max_qi'] - start[key];
            const gain = Math.min(c.parameters.effect.base, headroom) - 1;
            for (const states of [raw.immediate, raw.after, raw.music_steps[0].after])
                states[side][key] = start[key] + gain;
            if (side === 2) for (const field of ['extra_target_immediate', 'extra_target_after'])
                raw[field][key] = start[key] + gain;
            assert.throws(() => validateSkillMusicRecord(raw, c), c.id + ' side ' + side);
        }
    }
});

test('qixian damage must contain both qi damage and qi wound for each listener', () => {
    const c = music.find(c => c.id === 'skill-music-qixian-damage');
    for (const side of [1, 2]) for (const key of ['qi', 'eff_qi']) {
        const raw = musicRaw(c), start = side === 1 ? raw.before[1] : raw.extra_target_before;
        for (const states of [raw.immediate, raw.after, raw.music_steps[0].after])
            states[side][key] = start[key];
        if (side === 2) for (const field of ['extra_target_immediate', 'extra_target_after'])
            raw[field][key] = start[key];
        assert.throws(() => validateSkillMusicRecord(raw, c), key + ' side ' + side);
    }
});
