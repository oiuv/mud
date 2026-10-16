// Registration checks only; these are not native room/timer/acquisition samples.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources, validateMingjiaoRouteSelection } from './execution.mjs';
import { schoolSceneConditions, sceneEntries, validateSchoolSceneRecord } from './school_scene_cases.mjs';
import { mingjiaoRouteConditions, mingjiaoRouteSourcePaths } from './school_mingjiao_route_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = p => readFileSync(join(root, p), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = mingjiaoRouteConditions(catalog, read), main = cases.filter(c => c.parameters.route_mode !== 'cold');
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('58 original sources, six new tools and unchanged 15/48 observation sites are registered', () => {
    const s = snapshot(); validateQualificationSources(cases, s.files);
    assert.equal(mingjiaoRouteSourcePaths.length, 58);
    for (const p of mingjiaoRouteSourcePaths) assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    for (const name of ['route_observer.lpc', 'school_mingjiao_route_cases.mjs',
        'school_mingjiao_route_cases.test.mjs', 'school_mingjiao_route_integration.test.mjs',
        'school_mingjiao_route_report.mjs', 'school_mingjiao_route_report.test.mjs']) {
        const p = 'tools/tests/martial_data/' + name;
        assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    }
    const fusion = s.probes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = s.probes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    assert.equal(probes.length, 15);
    assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
});

test('main 8/16 and three independent single-job cold plans cannot mix with Fumo', () => {
    assert.equal(main.length, 8); assert.equal(main.reduce((n, c) => n + c.samples, 0), 16);
    assert.doesNotThrow(() => validateMingjiaoRouteSelection(main));
    const cold = cases.filter(c => c.parameters.route_mode === 'cold');
    assert.equal(cold.length, 3);
    for (const c of cold) assert.doesNotThrow(() => validateMingjiaoRouteSelection([c]));
    assert.throws(() => validateMingjiaoRouteSelection(cold), /独立驱动/);
    assert.throws(() => validateMingjiaoRouteSelection(cases), /独立驱动/);
    const old = schoolSceneConditions(catalog);
    assert.ok(old.every(c => c.parameters.collection_group === 'shaolin-fumo'));
    assert.doesNotThrow(() => validateMingjiaoRouteSelection(old));
    assert.throws(() => validateMingjiaoRouteSelection([main[0], old[0]]), /不得与其他场景混合/);
    assert.ok(sceneEntries(cases).every(e => e.role === 'scene'));
});

test('dispatch is explicit and fail-closed, retaining old default scene generator', () => {
    const source = read('tools/tests/martial_data/execution.mjs');
    assert.match(source, /startsWith\('school-scene-mingjiao-route-'\)/);
    assert.match(source, /if \(!routeScope\) return schoolSceneConditions\(catalog, settings\)/);
    assert.match(source, /assert\.ok\(isInside\(root, actual\), '路线来源链接越界/);
    assert.match(source, /validateMingjiaoRouteSelection\(conditions\)/);
    const invalid = structuredClone(main[0]); invalid.parameters.route_steps[0].action = 'eval 1';
    assert.throws(() => validateQualificationSources([invalid], snapshot().files));
    assert.throws(() => validateSchoolSceneRecord({ outcome: 'observed', method: 'scene' }, main[0]));
});

test('observation uses find only, three-element native call_out_info, original command and real wait', () => {
    const source = read('tools/tests/martial_data/route_observer.lpc');
    const points = source.slice(source.indexOf('private mapping room_point('), source.indexOf('mapping prepare('));
    assert.doesNotMatch(points, /load_object\(|new\(|->set\(|->move\(|destruct\(/);
    assert.match(source, /"break stone", "break men"/);
    assert.match(source, /player->force_me\(action\)/);
    assert.match(source, /sizeof\(entry\) == 3/);
    assert.doesNotMatch(source, /->close\(|->open_door\(|->set_door\(|->do_ketou\(/);
    const runner = read('tools/tests/martial_data/runner.lpc');
    const route = runner.slice(runner.indexOf('void begin_mingjiao_route('), runner.indexOf('void prepare_mingjiao_book_items()'));
    assert.match(route, /sizeof\(jobs\) == 1/);
    assert.match(route, /call_out\("advance_mingjiao_route"/);
    assert.doesNotMatch(route, /->close\(|->add\(|->set\(|reset_eval_cost\(/);
});

test('source hashes cannot be replaced and main waiting samples preserve signed resources', () => {
    const s = snapshot();
    assert.throws(() => validateQualificationSources(main,
        { ...s.files, 'd/mingjiao/shandong.c': '0'.repeat(64) }));
    for (const value of [2000, 2399]) {
        const c = main.find(c => c.parameters.variant === `neili${value}-force300`);
        assert.equal(c.parameters.actor.properties.neili, value);
        assert.deepEqual(c.parameters.route_steps.slice(1), [{ kind: 'wait', seconds: 6 }]);
    }
    const natural = main.find(c => c.parameters.route_mode === 'natural');
    assert.equal(natural.parameters.route_steps.filter(s => s.kind === 'command').length, 13);
    assert.equal(natural.parameters.route_steps.at(-2).action, 'go out');
});
