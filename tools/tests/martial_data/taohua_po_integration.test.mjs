import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { taohuaPoConditions, taohuaPoSourcePaths } from './school_taohua_po_cases.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const runner = read('tools/tests/martial_data/runner.lpc');
const header = read('tools/tests/martial_data/taohua_po_receivers.h');
const body = name => {
    const match = new RegExp('(?:private\\s+)?(?:int|void|mapping)\\s+' + name
        + '\\([^;]*?\\)\\s*\\{').exec(runner);
    assert.ok(match, 'actual definition: ' + name);
    const end = runner.indexOf('\n}\n', match.index);
    assert.ok(end > match.index, 'complete function: ' + name);
    return runner.slice(match.index, end + 3);
};
const between = (source, start, end) => {
    const first = source.indexOf(start), last = source.indexOf(end, first + start.length);
    assert.ok(first >= 0 && last > first, 'actual ordered hooks: ' + start + ' -> ' + end);
    return source.slice(first, last);
};

test('历史PO15788窗口保留完整旧15769正式/烟雾，新增19条件仍822/27', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke }).slice(0, 15788);
        assert.equal(all.length, 15788);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(sha256(JSON.stringify(all.slice(0, 15769))), smoke
            ? '18a97e0e620628b2df43fe9c8af62c2fba362345e83f693dc08eacb8b55072f5'
            : '85e6a38221a88d168e6809fc1c03b6c73a92f3facfa5a443e7f2ff406d058bbe');
        const tail = all.slice(15769);
        assert.equal(tail.length, 19);
        assert.deepEqual(tail, taohuaPoConditions(catalog, { smoke }));
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? '8d7498c44125df052c37d4cffb57b8766fbd973a27a936137ed8f31e5285a21e'
            : 'ee880690ba7e83ae10650a077f15024ab3376418fdbf1cc46e0b5584d0fba436');
        assert.equal(tail.reduce((n, c) => n + c.samples, 0), smoke ? 27 : 822);
        assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 26060 : 411986);
    }
});

test('PO条件/头/两集成测试及报告依赖实际冻结，原15文件48探针完整保持', () => {
    const snapshot = createSandbox(root);
    for (const name of ['school_taohua_po_cases.mjs', 'school_taohua_po.test.mjs',
        'taohua_po_receivers.h', 'taohua_po_integration.test.mjs',
        'taohua_po_report_integration.test.mjs', 'school_combat_report.mjs',
        'statistics.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(snapshot.files[path], sha256(read(path)), path);
    }
    assert.equal(snapshot.probes.length, 15);
    assert.equal(snapshot.probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(snapshot.probes)),
        'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.match(read('tools/tests/martial_data/execution.mjs'),
        /copy\('tools\/tests\/martial_data\/taohua_po_receivers\.h', 'tests\/taohua_po_receivers\.h'\)/);
});

test('原38来源严格绑定顺序和可用摘要，两能力摘要及入口不可偷换', () => {
    const conditions = taohuaPoConditions(catalog);
    assert.equal(taohuaPoSourcePaths.length, 38);
    assert.equal(new Set(taohuaPoSourcePaths).size, 38);
    const files = Object.fromEntries(taohuaPoSourcePaths.map(path => [path, sha256(read(path))]));
    validateQualificationSources(conditions, files);
    for (const path of taohuaPoSourcePaths) {
        const missing = { ...files }; delete missing[path];
        assert.throws(() => validateQualificationSources(conditions, missing), path);
        for (const value of [undefined, null, 0, '', 'not-a-sha'])
            assert.throws(() => validateQualificationSources(conditions, { ...files, [path]: value }), path);
    }
    const mutations = [
        c => delete c.parameters.qualification_sources,
        c => c.parameters.qualification_sources.pop(),
        c => c.parameters.qualification_sources.reverse(),
        c => c.parameters.qualification_sources.push('data/private.o'),
        c => c.parameters.qualification_sources[2] = c.parameters.qualification_sources[3],
        c => delete c.parameters.ability_source,
        c => delete c.parameters.base_source,
        c => c.parameters.ability_source.path = c.parameters.base_source.path,
        c => c.parameters.base_source.path = c.parameters.ability_source.path,
        c => c.parameters.ability_source.sha256 = '0'.repeat(64),
        c => c.parameters.base_source.sha256 = '0'.repeat(64),
        c => c.parameters.ability_source.sha256 = null,
        c => c.parameters.base_source.sha256 = 'invalid',
        c => c.parameters.ability_source.entry_id = 'wrong',
        c => delete c.parameters.ability_source.entry_id,
        c => c.entry_id = 'wrong',
    ];
    for (const mutate of mutations) {
        const changed = structuredClone(conditions[0]); mutate(changed);
        assert.throws(() => validateQualificationSources([changed], files));
    }
});

test('快照只读原两USER/真实副手与stable，原别名及enable上下文不补成功', () => {
    assert.match(header, /if \(!is_taohua_po\(\)\) return result/);
    assert.match(header, /side = member_array\(ob, players\)/);
    assert.match(header, /require\(side == 0 \|\| side == 1, "exact PO USER snapshot"\)/);
    assert.match(header, /"family\/family_name", "can_perform\/tanzhi-shentong\/po"/);
    assert.match(header, /ob->is_fighting\(players\[side \? 0 : 1\]\)/);
    assert.match(header, /ob->query_temp\("secondary_weapon"\)/);
    assert.match(header, /equipment_snapshot\(secondary\)/);
    assert.doesNotMatch(header, /->(?:set|set_temp|map_skill|move|wield|unwield|add_amount|set_amount)\s*\(|\b(?:call_out|random|destruct|revive|perform)\s*\(/);
    assert.match(body('snapshot'), /result = taohua_po_snapshot\(ob, result\)/);
    assert.match(body('equipment_snapshot'), /if \(is_taohua_po\(\)\) result\["stable"\] = item->query\("stable"\)/);
    const prepare = body('prepare_actor');
    assert.match(prepare, /if \(is_taohua_po\(\)\) \{\s*require\(ob->id\(side \? "right" : "left"\)/);
    assert.match(prepare, /present\(side \? "right" : "left", this_object\(\)\) == ob,\s*"original PO input resolves to exact USER"/);
    assert.match(prepare, /if \(!side && is_taohua_po\(\)\) \{\s*require\(ob->force_me\("enable finger tanzhi-shentong"\), "original PO enable context"\);\s*ob->map_skill\("finger"\)/);
    assert.match(runner, /#include "\/tests\/taohua_po_receivers\.h"/);
});

test('PO按两侧原hand/wield配装；不误纳古墓针的角色限制或临时加成', () => {
    const prepare = body('prepare_actor');
    const equipment = between(prepare, '} else if (is_taohua_po()) {', '} else if (needle_collection()) {');
    assert.match(equipment, /side == 0 && config\["equipment"\]\["hold"\]/);
    assert.match(equipment, /"\/d\/items\/throwing\/taohua_ban", "\/tests\/sword"/);
    assert.match(equipment, /side == 1 && config\["equipment"\]\["type"\] == "sword" &&\s*!config\["equipment"\]\["hold"\]/);
    assert.match(equipment, /weapon = new\(side == 0 \? config\["equipment"\]\["program"\] : "\/tests\/sword"\)/);
    assert.match(equipment, /if \(side == 0 && config\["equipment"\]\["type"\] == "throwing"\)/);
    assert.match(equipment, /intp\(config\["equipment"\]\["amount"\]\) && config\["equipment"\]\["amount"\] > 0/);
    assert.match(prepare, /require\(ob->force_me\("hand " \+ \(config\["equipment"\]\["hand_id"\] \|\| "jinshe zhui"\)\)/);
    assert.match(prepare, /ob->query_temp\("handing"\) == weapon && !ob->query_temp\("weapon"\)/);
    assert.match(prepare, /require\(weapon->wield\(\) && ob->query_temp\("weapon"\) == weapon, "weapon wielded"\)/);
    assert.match(prepare, /needle_collection\(\) && !is_taohua_po\(\) && side == 1 &&\s*member_array\(key, \(\{ "nopoison", "bingpo", "apply\/attack", "apply\/dodge",\s*"apply\/parry" \}\)\)/);
    assert.match(body('snapshot'), /if \(needle_collection\(\) && !is_taohua_po\(\)\)\s*foreach \(key in \(\{ "character", "special_skill\/piyi", "can_perform\/yufeng-zhen\/ying",\s*"can_perform\/bingpo-shenzhen\/bing"/);
});

test('施展前保存手中原物及目标原主器，三时点读取相同引用和真实载体', () => {
    const perform = body('perform_sample');
    const capture = between(perform, 'if (is_taohua_po()) {', 'players[0]->start_observation(0);');
    assert.match(capture, /needle_object = players\[0\]->query_temp\("handing"\)/);
    assert.match(capture, /taohua_po_target_weapon = players\[1\]->query_temp\("weapon"\)/);
    assert.match(capture, /"actor_room": file_name\(environment\(players\[0\]\)\)/);
    assert.match(capture, /"target_room": file_name\(environment\(players\[1\]\)\)/);
    assert.match(capture, /observe_taohua_po_weapon\("before"\)/);
    assert.ok(perform.indexOf('observe_taohua_po_weapon("before")') < perform.indexOf('action = parameters["action"]'));
    assert.match(perform, /result = players\[0\]->force_me\(action\);\s*current\["command_accepted"\] = result/);
    assert.doesNotMatch(perform, /\/tanzhi-shentong\/po["']?->perform|command_accepted"\]\s*=\s*!!/);
    assert.match(header, /\(\{ "before", "immediate", "after" \}\)/);
    assert.match(header, /result = equipment_snapshot\(taohua_po_target_weapon\)/);
    assert.match(header, /carrier = environment\(taohua_po_target_weapon\)/);
    assert.match(header, /result\["equipped"\] = taohua_po_target_weapon->query\("equipped"\)/);
    assert.match(header, /current\["po_equipment"\]\["target_weapon"\]\[phase\] = result/);
    assert.doesNotMatch(header, /query_temp\("weapon"\)|\bnew\s*\(|clone_object\(/);
    assert.match(body('advance'), /current\["immediate"\] = \(\{ snapshot\(players\[0\]\), snapshot\(players\[1\]\) \}\);\s*observe_taohua_po_weapon\("immediate"\)/);
    assert.ok(body('finish_sample').indexOf('current["after"]') < body('finish_sample').indexOf('observe_taohua_po_weapon("after")'));
});

test('最后一枚仅等原零延迟销毁，先记原物/落器再清理；复用原weapon hit_ob身份', () => {
    const advance = body('advance'), finish = body('finish_sample');
    const deferred = /if \(is_taohua_po\(\)\) \{([\s\S]*?)\n    \}/.exec(advance);
    assert.ok(deferred);
    assert.equal(deferred[1].replace(/\/\/[^\n]*/g, '').replace(/\s+/g, ' ').trim(),
        'call_out("finish_sample", 0); return;');
    assert.doesNotMatch(deferred[1], /destruct\(|observation_heartbeat\(|needle_object\s*=|taohua_po_target_weapon\s*=/);
    assert.ok(advance.indexOf('destruct(ob)') < advance.indexOf('perform_sample()'));
    assert.match(advance, /taohua_po_target_weapon = 0/);
    assert.match(finish, /collection_group"\] == "gumu-throwing" \|\| is_taohua_po\(\)/);
    assert.match(finish, /"object_exists": objectp\(needle_object\)/);
    assert.match(finish, /"handing_object": serializable\(players\[0\]->query_temp\("handing"\)\)/);
    const dropped = between(finish, 'current["dropped"] = ({});', 'foreach (ob in players)');
    assert.match(dropped, /"object": file_name\(ob\)/);
    assert.doesNotMatch(dropped, /destruct\(|->move\(|->wield\(/);
    assert.ok(finish.indexOf('current["dropped"]') < finish.indexOf('emit(current)'));
    const needle = body('observe_needle_hit');
    assert.match(body('needle_collection'), /"gumu-throwing", "gumu-needle-lifecycle", "taohua-po"/);
    assert.match(needle, /if \(!active \|\| !needle_collection\(\)\) return/);
    assert.match(needle, /require\(me == players\[0\] && victim == players\[1\], "needle participants"\)/);
    assert.match(needle, /"program": base_name\(weapon\), "object": file_name\(weapon\), "damage_bonus": damage_bonus/);
});

test('昏迷资格/交战/准备分账三门禁都含PO，原终态先隔离再开始施展计数', () => {
    const perform = body('perform_sample');
    const prep = between(perform, 'if (parameters["target_state"] == "unconscious") {',
        'if (parameters["collection_group"] == "wudang-lookup") prepare_lookup(parameters);');
    assert.equal((prep.match(/"taohua-po"/g) ?? []).length, 3);
    assert.match(prep, /!parameters\["fighting"\] \|\| member_array/);
    assert.match(prep, /current\["preparation"\] = \(\[ "before": snapshot\(players\[1\]\) \]\)/);
    assert.match(prep, /players\[1\]->start_observation\(1\);\s*players\[1\]->unconcious\(\);\s*players\[1\]->stop_observation\(\)/);
    assert.match(prep, /current\["preparation"\]\["after"\] = snapshot\(players\[1\]\)/);
    assert.match(prep, /!living\(players\[1\]\) && !players\[1\]->is_ghost\(\)/);
    assert.match(prep, /current\["preparation"\]\["terminals"\] = copy\(current\["terminals"\]\);\s*current\["terminals"\] = \(\{\}\)/);
    assert.doesNotMatch(prep, /revive|set_heart_beat|observation_heartbeat\(1\)|->set\(|->set_temp\(/);
    assert.ok(perform.indexOf('current["preparation"]["terminals"]') < perform.indexOf('current["before"]'));
    assert.ok(perform.indexOf('current["before"]') < perform.indexOf('players[0]->start_observation(0)'));
});
