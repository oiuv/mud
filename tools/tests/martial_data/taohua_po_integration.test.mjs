import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { mingjiaoJiuyangFusionProbes, restoreMingjiaoJiuyangFusionProbes }
    from './school_mingjiao_jiuyang_fusion_probes.mjs';
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
    // Only the separately reviewed yanlian probe is projected out of the old 15/48 baseline.
    const fusionPath = 'cmds/skill/yanlian.c';
    const fusionProbes = snapshot.probes.filter(p => p.path === fusionPath);
    assert.equal(fusionProbes.length, 1);
    const fusionSource = read(fusionPath);
    const prepared = mingjiaoJiuyangFusionProbes(fusionSource, { collectionGroup: 'mingjiao-jiuyang-fusion' });
    assert.equal(prepared.sites.length, 17);
    assert.deepEqual(fusionProbes[0], { path: fusionPath, before: sha256(fusionSource),
        after: sha256(prepared.changed), sites: prepared.sites });
    assert.equal(snapshot.files[fusionPath], sha256(fusionSource));
    assert.equal(restoreMingjiaoJiuyangFusionProbes(prepared.changed), fusionSource);
    for (const name of [
        'school_mingjiao_jiuyang_fusion_cases.mjs',
        'school_mingjiao_jiuyang_fusion_cases.test.mjs',
        'school_mingjiao_jiuyang_fusion_observation.mjs',
        'school_mingjiao_jiuyang_fusion_observation.test.mjs',
        'school_mingjiao_jiuyang_fusion_probes.mjs',
        'school_mingjiao_jiuyang_fusion_probes.test.mjs',
        'school_mingjiao_jiuyang_fusion_record.mjs',
        'school_mingjiao_jiuyang_fusion_record.test.mjs',
        'school_mingjiao_jiuyang_fusion_report.mjs',
        'school_mingjiao_jiuyang_fusion_report.test.mjs',
        'school_mingjiao_jiuyang_fusion_integration.test.mjs',
        'jiuyang_fusion_receivers.h',
    ]) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(snapshot.files[path], sha256(read(path)), path);
    }
    const historicalProbes = snapshot.probes.filter(p => p.path !== fusionPath);
    assert.equal(historicalProbes.length, 15);
    assert.equal(historicalProbes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(historicalProbes)),
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
    const advance = body('advance');
    // Project out only the exact, separately reviewed route-only early return.
    // Any other inserted operation must still fail the original PO sequence check.
    const routeBranch = '    if (current["parameters"]["collection_group"] == "mingjiao-route") {\n'
        + '        advance_mingjiao_route();\n        return;\n    }\n';
    assert.equal(advance.split(routeBranch).length, 2, 'one exact route-only branch');
    const exertImmediate = '    if (current["parameters"]["collection_group"] == "mingjiao-jiuyang-exert") {\n'
        + '        current["relation_context"]["immediate"] = jiuyang_exert_relations();\n'
        + '        if (mapp(current["parameters"]["extra_target"]))\n'
        + '            current["extra_target_immediate"] = snapshot(players[2]);\n    }\n';
    assert.equal(advance.split(exertImmediate).length, 2, 'one exact exert-only immediate observation');
    const fusionBranch = '    if (is_jiuyang_fusion()) {\n'
        + '        start_jiuyang_fusion_wait();\n        return;\n    }\n';
    assert.equal(advance.split(fusionBranch).length, 2, 'one exact fusion-only early return');
    assert.equal(body('is_mingjiao_remaining_perform').replace(/\s+/g, ' ').trim(),
        'private int is_mingjiao_remaining_perform() { return current["parameters"]["collection_group"] == "mingjiao-remaining-perform"; }',
        'project only the exact remaining-perform group');
    const remainingImmediate = '    if (is_mingjiao_remaining_perform()) {\n'
        + '        current["enemy_context"]["immediate"] = map(players[0]->query_enemy(),\n'
        + '            (: member_array($1, players) :));\n'
        + '        if (mapp(current["parameters"]["extra_target"]))\n'
        + '            current["extra_target_immediate"] = snapshot(players[2]);\n'
        + '        observe_remaining_perform_flower("immediate");\n'
        + '        if (current["parameters"]["ability"] == "hua") {\n'
        + '            // Original set_amount(0) already queued destruct_me. Only observe after its return.\n'
        + '            call_out("finish_sample", 0);\n'
        + '            return;\n'
        + '        }\n'
        + '    }\n';
    assert.equal(advance.split(remainingImmediate).length, 2, 'one exact remaining-perform immediate branch');
    assert.equal(body('is_mingjiao_remaining_base').replace(/\s+/g, ' ').trim(),
        'private int is_mingjiao_remaining_base() { return current["parameters"]["collection_group"] == "mingjiao-remaining-base"; }',
        'project only the exact remaining-base group');
    const remainingBaseImmediate = '    if (is_mingjiao_remaining_base()) {\n'
        + '        current["immediate_metrics"] = ({\n'
        + '            players[0]->query_observation(),\n'
        + '            players[1]->query_observation()\n'
        + '        });\n'
        + '        if (current["method"] == "condition") {\n'
        + '            if (current["condition_seed"]["seeded"]) {\n'
        + '                players[1]->observation_heartbeat(1);\n'
        + '                call_out("poll", 1);\n'
        + '            } else finish_sample();\n'
        + '            return;\n'
        + '        }\n'
        + '    }\n';
    assert.equal(advance.split(remainingBaseImmediate).length, 2, 'one exact remaining-base immediate branch');
    const forceImmediate = "    if (is_mingjiao_force_remaining()) {\n"
        + "        current[\"immediate_metrics\"] = ({\n"
        + "            players[0]->query_observation(),\n"
        + "            players[1]->query_observation()\n"
        + "        });\n"
        + "        if (current[\"outcome\"] == \"observed\" && member_array(current[\"parameters\"][\"panel\"],\n"
        + "            ({ \"exercise\", \"healing\", \"expiry\" })) != -1) {\n"
        + "            players[0]->observation_heartbeat(1);\n"
        + "            call_out(\"poll\", 1);\n"
        + "        } else finish_sample();\n"
        + "        return;\n"
        + "    }\n";
    assert.equal(advance.split(forceImmediate).length, 2, 'one exact force-remaining immediate branch');
    assert.equal(body('is_mingjiao_force_remaining').replace(/\s+/g, ' ').trim(),
        'int is_mingjiao_force_remaining() { return mapp(current) && mapp(current["parameters"]) && current["parameters"]["collection_group"] == "mingjiao-force-remaining"; }');
    assert.match(advance.replace(forceImmediate, '').replace(routeBranch, '').replace(exertImmediate, '').replace(fusionBranch, '')
        .replace(remainingImmediate, '').replace(remainingBaseImmediate, ''), /current\["immediate"\] = \(\{ snapshot\(players\[0\]\), snapshot\(players\[1\]\) \}\);\s*observe_taohua_po_weapon\("immediate"\)/);
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
    assert.equal(body('is_mingjiao_remaining_perform').replace(/\s+/g, ' ').trim(),
        'private int is_mingjiao_remaining_perform() { return current["parameters"]["collection_group"] == "mingjiao-remaining-perform"; }',
        'project only the exact remaining-perform group');
    const actualNeedle = body('observe_needle_hit');
    const remainingNeedle = '    if (!active || (!needle_collection() && !is_mingjiao_remaining_perform())) return;\n'
        + '    if (is_mingjiao_remaining_perform()) {\n'
        + '        if (current["parameters"]["ability"] != "hua") return;\n'
        + '        require(weapon == remaining_perform_flower &&\n'
        + '            base_name(weapon) == "/clone/weapon/flower_leaf", "same original flower hit_ob");\n'
        + '    }\n';
    assert.equal(actualNeedle.split(remainingNeedle).length, 2, 'one exact remaining-perform needle guard');
    const needle = actualNeedle.replace(remainingNeedle, '    if (!active || !needle_collection()) return;\n');
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
