import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { taohuaZhuanConditions, taohuaZhuanSourcePaths } from './school_taohua_zhuan_cases.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const body = (source, name) => {
    const match = new RegExp('(?:private\\s+)?(?:int|void|mapping)\\s+' + name
        + '\\([^;]*?\\)\\s*\\{').exec(source);
    assert.ok(match, 'actual definition: ' + name);
    const end = source.indexOf('\n}\n', match.index);
    assert.ok(end > match.index, 'complete function: ' + name);
    return source.slice(match.index, end + 3);
};

test('旧15788完整条件与原顺序保持，仅尾追加原24条转乾坤', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke })
            .filter(c => !['taohua-direct', 'taohua-control', 'taohua-attack', 'taohua-combo', 'taohua-bihai', 'taohua-passive', 'taohua-combination'].includes(c.parameters.collection_group));
        assert.equal(all.length, 15812);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(sha256(JSON.stringify(all.slice(0, 15788))), smoke
            ? 'b9e7ac4ab3fb7eb0526d9460c318fd310b1e2e3cb117cc8b3e396b0eb686dfb4'
            : '3c7045b7826a0b9a2586f684764196ef823a16f6b7e420f6339ae24f04e20f1b');
        const tail = all.slice(15788);
        assert.deepEqual(tail, taohuaZhuanConditions(catalog, { smoke }));
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? 'edc59573f318597bf2d60829614771529017ccf9d2ee030bfa285d639b7586b7'
            : 'ab3a00d43bb600e330e34087f6c6a16dfd593856cb4f9139111da0d7c6cd0232');
        assert.equal(tail.reduce((sum, c) => sum + c.samples, 0), smoke ? 24 : 734);
    }
});

test('实际新工具冻结、原15文件48探针及43项来源全部对应', () => {
    const snapshot = createSandbox(root);
    for (const name of ['school_taohua_zhuan_cases.mjs', 'school_taohua_zhuan.test.mjs',
        'taohua_zhuan_receivers.h', 'taohua_zhuan_integration.test.mjs',
        'school_taohua_zhuan_report.test.mjs', 'school_combat_report.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(snapshot.files[path], sha256(read(path)), path);
    }
    assert.equal(snapshot.probes.length, 15);
    assert.equal(snapshot.probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(snapshot.probes)),
        'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    const conditions = taohuaZhuanConditions(catalog);
    assert.equal(taohuaZhuanSourcePaths.length, 43);
    validateQualificationSources(conditions, snapshot.files);
    for (const key of ['ability_source', 'base_source']) {
        const bad = structuredClone(conditions[0]);
        bad.parameters[key].sha256 = '0'.repeat(64);
        assert.throws(() => validateQualificationSources([bad], snapshot.files));
    }
    const missing = structuredClone(conditions[0]);
    missing.parameters.qualification_sources.pop();
    assert.throws(() => validateQualificationSources([missing], snapshot.files));
    const entry = structuredClone(conditions[0]);
    entry.parameters.ability_source.entry_id += ':wrong';
    assert.throws(() => validateQualificationSources([entry], snapshot.files));
});

test('真实原命令准备、direct双挂点与原昏迷三名单均接入', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /original ZHUAN input resolves to exact USER/);
    assert.match(runner, /original ZHUAN enable context/);
    assert.match(runner, /result = taohua_zhuan_snapshot\(ob, result\)/);
    assert.match(runner, /gumu-unarmed-learning", "taohua-zhuan"/);
    assert.equal([...runner.matchAll(/"taohua-ding",\s*"taohua-xiao",\s*"taohua-po",\s*"taohua-zhuan"/g)].length, 3);
    assert.equal([...runner.matchAll(/"gumu-quanzhen",\s*"gumu-temporal",\s*"taohua-ding",\s*"taohua-zhuan"/g)].length, 2);
    const perform = body(runner, 'perform_sample');
    const command = perform.indexOf('result = players[0]->force_me(action);');
    const guard = perform.indexOf('if ((is_taohua_ding() || is_taohua_zhuan()) && !result && !sizeof(current["refusals"]))', command);
    assert.ok(command >= 0 && guard > command, '只在原命令返回且没有已观测拒绝时补登记');
    const refusal = perform.slice(guard, perform.indexOf('if (current["method"] == "exercise")', guard));
    assert.match(refusal, /reason = players\[0\]->query_temp\("notify_fail"\)/);
    assert.match(refusal, /"actor": file_name\(players\[0\]\), "reason": reason/);
    assert.doesNotMatch(refusal, /parameters\["refusal"\]|query_notify_fail\(\)/,
        '读取原角色的实际文本，不写预设答案或另一调用者的失败信息');
});

test('原尸体引用捕获不截断死亡栈，同步原件保存之后仅清理同物', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const receiver = body(runner, 'observe_taohua_zhuan_corpse');
    const requireDeclaration = runner.indexOf('void require(int condition, string message);');
    assert.ok(requireDeclaration >= 0 && requireDeclaration < runner.indexOf(receiver),
        'typed LPC calls require an earlier declaration');
    assert.ok(requireDeclaration < runner.indexOf('private void clear_taohua_zhuan_owned()'));
    assert.match(receiver, /victim == players\[1\] && killer == players\[0\]/);
    assert.match(receiver, /taohua_zhuan_corpse = corpse/);
    assert.doesNotMatch(receiver, /finish_sample|destruct\(|die\(|move\(/);
    const prepare = body(runner, 'perform_sample');
    assert.match(prepare, /taohua_zhuan_target_weapon = players\[1\]->query_temp\("weapon"\)/);
    assert.match(prepare, /taohua_zhuan_before = taohua_zhuan_death_before\(players\[1\], players\[0\]\)/);
    const advance = body(runner, 'advance');
    const perform = advance.indexOf('perform_sample();');
    const observed = advance.indexOf('current["immediate"] =', perform);
    const receipt = advance.indexOf('current["zhuan_death"] =', observed);
    assert.ok(perform >= 0 && observed > perform && receipt > observed);
    const branchEnd = advance.indexOf('return;', receipt);
    const branch = advance.slice(advance.lastIndexOf('if (is_taohua_zhuan())', receipt), branchEnd);
    assert.match(branch, /finish_sample\(\)/);
    assert.doesNotMatch(branch, /call_out|unconcious\(|die\(|destruct\(/);
    const finish = body(runner, 'finish_sample');
    assert.ok(finish.indexOf('emit(current)') < finish.indexOf('clear_taohua_zhuan_owned()'));
    const cleanup = body(runner, 'clear_taohua_zhuan_owned');
    assert.match(cleanup, /all_inventory\(taohua_zhuan_corpse\)/);
    assert.match(cleanup, /item == taohua_zhuan_target_weapon/);
    assert.doesNotMatch(cleanup, /DEATH_ROOM|all_inventory\(this_object\(\)\)|make_corpse|die\(/);
    assert.match(read('tools/tests/martial_data/npc_bout_receivers.h'),
        /if \(observe_taohua_zhuan_corpse\(victim, killer, corpse\)\) return;/);
});

test('新死亡快照只读，保留真实技能keys顺序和熟练原类型', () => {
    const header = read('tools/tests/martial_data/taohua_zhuan_receivers.h');
    assert.match(header, /result\["skill_order"\] = keys\(skills\)/);
    assert.match(header, /learned = ob->query_learned\(\)/);
    assert.match(header, /"learned_was_mapping": mapp\(learned\)/);
    assert.match(header, /carrier = environment\(weapon\)/);
    assert.match(header, /all_inventory\(corpse\)/);
    for (const phase of ['before', 'after']) {
        for (const field of ['has_member', 'undefined', 'count'])
            assert.ok(header.includes('killer_wanted_pks_' + phase + '_' + field));
        assert.ok(header.includes('killer_combat_' + phase + '_raw'));
        assert.ok(header.includes('killer_combat_' + phase + '_was_mapping'));
    }
    assert.match(header, /undefinedp\(/, '缺省计数须以原未定义标志证明');
    assert.match(header, /member_array\("WPK", keys\(/, '以原mapping成员证明缺省而非猜null');
    assert.doesNotMatch(header, /"killer_wanted_pks_delta": killer->query\(/,
        '未定义原值不可直接作减法后丢失可观察零差额');
    assert.doesNotMatch(header, /->(?:set|add|delete|move|die|unconcious|revive|force_me)\(|\b(?:random|destruct|call_out|shutdown)\(/);
});
