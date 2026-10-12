import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { npcEntries } from './school_emei_npc_cases.mjs';
import { gumuNpcBoutConditions } from './school_gumu_npc_bout_cases.mjs';
import { createSandbox } from './execution.mjs';
import { summarizeSamples, statisticsMarkdown } from './statistics.mjs';
import { gumuNpcBoutReport, gumuNpcBoutMarkdown } from './school_gumu_npc_bout_report.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const read = path => readFileSync(join(root, path), 'utf8');

test('只尾追加5原NPC条件；旧15725和12024教学契约由原测试保留', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke }).slice(0, 15730);
        assert.equal(all.length, 15730);
        const current = all.slice(15725);
        assert.deepEqual(current, gumuNpcBoutConditions(catalog, read, { smoke }));
        assert.equal(sha256(JSON.stringify(current)), smoke
            ? 'b015dd53587252d8c609ddeb4e6a128ee48685c6a034ce0c3bcfd7a9030cc1e4'
            : '6b03296cc5bb01c17e3d4f281c68de2aa20ccbae1081ecacf0168972f70f7502');
        assert.equal(all.reduce((sum, c) => sum + c.samples, 0), smoke ? 25955 : 409714);
        assert.equal(npcEntries(current).length, 4);
        assert.ok(npcEntries(current).every(e => e.path.startsWith('kungfu/class/gumu/')));
    }
});

test('隔离源冻结头文件/专用报告/真实四条源链；旧10探针仍保留', () => {
    const snapshot = createSandbox(root);
    for (const name of ['npc_bout_receivers.h', 'npc_bout_probes.mjs', 'npc_bout_probes.test.mjs',
        'npc_bout_integration.test.mjs', 'school_gumu_npc_bout_cases.mjs',
        'school_gumu_npc_bout_report.mjs', 'school_gumu_npc_bout_report.test.mjs'])
        assert.equal(snapshot.files['tools/tests/martial_data/' + name], sha256(read('tools/tests/martial_data/' + name)));
    assert.equal(snapshot.probes.filter(p => p.path !== 'kungfu/skill/tanzhi-shentong/ding.c').length, 14);
    for (const path of ['inherit/char/char.c', 'inherit/char/npc.c', 'feature/damage.c', 'adm/daemons/chard.c'])
        assert.ok(snapshot.probes.some(p => p.path === path && p.before !== p.after && p.sites.length));
});

test('空/错误报告保留未知；统计与学校页面只用NPC专节，不用旁观USER计损', () => {
    const condition = gumuNpcBoutConditions(catalog, read)[0];
    const manifest = { identity: { conditions: [condition], execution: {} }, versions: {}, fingerprint: 'synthetic' };
    assert.throws(() => summarizeSamples(manifest, []), /具名专用报告/);
    const summary = summarizeSamples(manifest, [], { npcBoutReport: gumuNpcBoutReport });
    const c = summary.conditions[0];
    assert.equal(c.sides, null); assert.equal(c.bouts, null);
    assert.equal(c.npc_bout_effects.coverage.missing, 20);
    assert.throws(() => statisticsMarkdown(summary), /通用对方计损表/);
    const markdown = statisticsMarkdown(summary, { npcBoutMarkdown: gumuNpcBoutMarkdown });
    assert.match(markdown, /USER1 只在场外旁观/); assert.match(markdown, /NPC 毛消耗与毛恢复未观察/);
    assert.doesNotMatch(markdown, /对方气血支出/);
    const school = schoolCombatMarkdown({ ...summary, evidence_sha256: 'synthetic',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0 },
        conditions: [{ ...c, effects: null }] });
    assert.match(school, /古墓原 NPC 自然交锋/);
});

test('receiver按确切对象并分开原NPC/USER链，终态不在原栈内同步清理', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const header = read('tools/tests/martial_data/npc_bout_receivers.h');
    const fn = (source, name) => {
        const marker = new RegExp('(?:int|void|mapping)\\s+' + name + '\\(');
        const start = source.search(marker); assert.ok(start >= 0, name);
        return source.slice(start).split('\n}\n')[0];
    };
    assert.match(fn(header, 'observe_npc_heartbeat'), /ob == gumu_npc/);
    assert.match(fn(header, 'observe_npc_round'), /ob != gumu_npc/);
    assert.match(fn(runner, 'strategy'), /record_npc_bout_heartbeat\(ob\)/);
    assert.match(fn(runner, 'observe_attack_round'), /observe_npc_bout_user_round/);
    const terminal = fn(header, 'observe_npc_terminal');
    assert.match(terminal, /pending_choice_index/); assert.match(terminal, /pending_round_index/);
    assert.match(terminal, /call_out\("finish_sample", 0\)/);
    assert.doesNotMatch(terminal, /->die\(|clear_gumu|destruct\(/);
    const finishing = fn(header, 'finish_npc_bout_observation');
    const capture = finishing.indexOf('->capture_gumu_bout()'), clear = finishing.lastIndexOf('->clear_gumu_bout()');
    const metrics = finishing.lastIndexOf('current["metrics"]');
    assert.ok(capture >= 0 && metrics > capture && clear > metrics);
});

test('NPC交锋真实USER快照读取副手；不把漏采字段补为空映射', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /if \(is_npc_bout\(\)\) \{\s+secondary = ob->query_temp\("secondary_weapon"\);\s+result\["secondary_weapon"\] = secondary \? secondary->query\("skill_type"\) : "none";\s+result\["secondary_weapon_details"\] = equipment_snapshot\(secondary\);/);
});
