// Read immutable, completed route evidence. This module never launches a driver.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openSeries, readSamples, digest } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { validateRecord } from './execution.mjs';
import { mingjiaoRouteConditions, mingjiaoRouteSourcePaths, mingjiaoRouteReviewedSourceHash,
    validateMingjiaoRouteRecord, mingjiaoRouteEffects } from './school_mingjiao_route_cases.mjs';
import { mingjiaoJiuyangFusionProbes, mingjiaoJiuyangFusionProbePath } from './school_mingjiao_jiuyang_fusion_probes.mjs';

const group = 'mingjiao-route';
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const key = row => row.condition_id + '.' + row.index;
const integer = value => assert.ok(Number.isSafeInteger(value) && value >= 0, '缺少非负整数');
const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
    .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');

function boundedFile(root, path) {
    const target = realpathSync(join(root, path)), rel = relative(realpathSync(root), target);
    assert.ok(!isAbsolute(rel) && rel !== '..' && !rel.startsWith('../') && !rel.startsWith('..\\'),
        '冻结原件链接越出运行目录');
    return readFileSync(target);
}

// Reverse only the registered inserts, in memory. Never substitute current source.
function frozenSource(execution, run, path) {
    let source = boundedFile(join(run, 'mudlib'), path).toString('utf8');
    const probe = execution.probes.find(p => p.path === path);
    assert.equal(sha256(source), probe?.after ?? execution.source_files[path], '冻结副本改变：' + path);
    if (probe) {
        for (const site of [...probe.sites].reverse()) {
            const anchor = Array.isArray(site) ? site[0] : site.anchor;
            const insert = Array.isArray(site) ? site[1] : site.insert;
            const observed = site.replacement ?? (Array.isArray(site) || site.position === 'before'
                ? insert + anchor : anchor + insert);
            assert.equal(source.split(observed).length, 2, '探针锚点不唯一');
            source = source.replace(observed, anchor);
        }
        assert.equal(sha256(source), probe.before, '探针不能逆还原');
    }
    assert.equal(sha256(source), execution.source_files[path], '原源码摘要不同：' + path);
    return source;
}

function verifyRun(directory, name, manifest, evidence) {
    const run = join(directory, 'runs', name), execution = manifest.identity.execution;
    const result = json(join(run, 'result.json')), process = json(join(run, 'process.json'));
    assert.equal(result.process.code, 0, '驱动未正常结束');
    assert.equal(result.process.signal, null, '驱动有终止信号');
    integer(result.process.pid); assert.ok(result.process.pid > 0);
    assert.equal(process.pid, result.process.pid, '运行进程身份不同');
    assert.equal(process.driver, execution.driver.path, '运行驱动路径不同');
    assert.ok(typeof process.started === 'string' && Number.isFinite(Date.parse(process.started)));
    assert.equal(result.interrupted, false); assert.deepEqual(result.validation_errors, []);
    assert.equal(result.incomplete_bytes, 0); integer(result.imported);
    assert.ok(Number.isFinite(result.elapsed_seconds) && result.elapsed_seconds >= 0);
    const output = readFileSync(join(run, 'driver-output.txt'), 'utf8');
    assert.equal(sha256(output), result.driver_output_sha256, '驱动日志摘要不同');
    // The collector can append its exact reset warning between stdout chunks.
    // Accept only that documented prefix, retaining the original log and SHA.
    assert.match(output, /(?:^|\r?\n)(?:Client error: ECONNRESET)?DATA COMPLETE(?:\r?\n|$)/);
    assert.doesNotMatch(output, /DATA (?:SAMPLE ERROR|WATCHDOG|CANCELLED|FAIL)/);
    assert.ok(output.includes(execution.driver.version), '驱动版本日志不同');
    const fusion = execution.probes.filter(p => p.path === mingjiaoJiuyangFusionProbePath);
    assert.ok(fusion.length <= 1, '融合观察器重复');
    const legacyProbes = execution.probes.filter(p => p.path !== mingjiaoJiuyangFusionProbePath);
    assert.equal(legacyProbes.length, 15, '原观察器数量不符');
    assert.equal(legacyProbes.reduce((n, p) => n + p.sites.length, 0), 48, '原观察点数量不符');
    assert.deepEqual(legacyProbes.map(p => p.path).sort(), [
        'adm/daemons/combatd.c', 'cmds/skill/perform.c', 'cmds/skill/exert.c',
        'kungfu/skill/dugu-jiujian/qi.c', 'kungfu/skill/taiji-quan.c', 'feature/condition.c',
        'kungfu/skill/fireice-strike/binghuo.c', 'feature/equip.c', 'kungfu/skill/bingpo-shenzhen/bing.c',
        'feature/action.c', 'inherit/char/char.c', 'inherit/char/npc.c', 'feature/damage.c',
        'adm/daemons/chard.c', 'kungfu/skill/tanzhi-shentong/ding.c',
    ].sort(), '原观察器路径改变');
    assert.equal(new Set(execution.probes.map(p => p.path)).size, execution.probes.length);
    if (fusion.length) assert.equal(fusion[0].sites.length, 17, '融合观察点数量不符');
    const source = new Map();
    for (const path of new Set([...mingjiaoRouteSourcePaths, ...execution.probes.map(p => p.path)]))
        source.set(path, frozenSource(execution, run, path));
    if (fusion.length) {
        // Regenerate only from the actual run copy restored above, never the checkout.
        const expected = mingjiaoJiuyangFusionProbes(source.get(mingjiaoJiuyangFusionProbePath),
            { collectionGroup: 'mingjiao-jiuyang-fusion' });
        assert.deepEqual(fusion[0], { path: expected.path, before: expected.before,
            after: expected.after, sites: expected.sites }, '融合探针完整声明不符');
        assert.ok(Object.hasOwn(execution.source_files, 'tools/tests/martial_data/jiuyang_fusion_receivers.h'),
            '融合接收头未冻结');
    }
    for (const [original, copied] of [
        ...['runner', 'route_observer', 'teaching_actor', 'actor', 'master'].map(name =>
            ['tools/tests/martial_data/' + name + '.lpc', 'tests/' + name + '.lpc']),
        ['tools/tests/weapon_balance/actor.lpc', 'tests/base_actor.lpc'],
        ['tools/tests/weapon_balance/master.lpc', 'tests/base_master.lpc'],
        ...(fusion.length ? [['tools/tests/martial_data/jiuyang_fusion_receivers.h',
            'tests/jiuyang_fusion_receivers.h']] : []),
    ]) {
        assert.equal(sha256(boundedFile(join(run, 'mudlib'), copied)),
            execution.source_files[original], '执行夹具副本改变：' + copied);
    }
    const catalog = json(join(directory, 'catalog.json'));
    assert.equal(catalog.source_fingerprint, manifest.identity.source_fingerprint);
    assert.equal(catalog.dictionary_sha256, manifest.identity.dictionary_sha256);
    const current = mingjiaoRouteConditions(catalog, path => source.get(path), { smoke: execution.smoke });
    for (const c of manifest.identity.conditions)
        assert.equal(digest(c), digest(current.find(x => x.id === c.id)), '冻结路线条件改变');
    const request = json(join(run, 'request.json')), options = json(join(run, 'mudlib/tests/options.json'));
    assert.equal(request.fingerprint, manifest.fingerprint);
    assert.equal(request.interrupt_after, null); assert.equal(options.fault, null);
    assert.deepEqual(Object.keys(options).sort(), ['fault', 'jobs']);
    assert.ok(Array.isArray(request.jobs) && request.jobs.length > 0);
    assert.equal(new Set(request.jobs.map(key)).size, request.jobs.length, '请求重复');
    const jobs = request.jobs.map(job => {
        const c = manifest.identity.conditions.find(c => c.id === job.condition_id);
        assert.ok(c, '请求不是本系列条件'); integer(job.index); assert.ok(job.index < c.samples);
        assert.deepEqual(Object.keys(job).sort(), ['condition_id', 'index']);
        return { ...c, condition_id: c.id, index: job.index };
    });
    // collectionInput receives the actual missingJobs shape, not a compact request.
    for (const [i, job] of options.jobs.entries()) {
        assert.deepEqual(job, { condition_id: jobs[i]?.condition_id, index: jobs[i]?.index,
            method: jobs[i]?.method, parameters: jobs[i]?.parameters }, '执行参数不符');
    }
    assert.equal(options.jobs.length, jobs.length);
    if (manifest.identity.conditions[0].parameters.route_mode === 'cold') assert.equal(jobs.length, 1,
        '首载顺序必须是单样本独立驱动');
    const log = readFileSync(join(run, 'mudlib/log/events.jsonl'), 'utf8');
    assert.ok(log.endsWith('\n'), '原件尾行不完整');
    const raws = log.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
    assert.equal(raws.length, jobs.length); assert.equal(result.imported, raws.length);
    const allowed = new Set(jobs.map(key)), seen = new Set();
    for (const raw of raws) {
        assert.ok(allowed.has(key(raw)), '原件不属于请求'); assert.ok(!seen.has(key(raw)), '原件重复');
        seen.add(key(raw)); assert.ok(!evidence.has(key(raw)), '跨运行原件重复');
        evidence.set(key(raw), digest(raw));
        const c = manifest.identity.conditions.find(c => c.id === raw.condition_id);
        validateRecord(raw, c); validateMingjiaoRouteRecord(raw, c);
    }
    return { name, ...result, request_sha256: digest(request), options_sha256: digest(options),
        events_sha256: sha256(log) };
}

export function readMingjiaoRoute(directory) {
    directory = realpathSync(directory);
    const manifest = openSeries(directory), execution = manifest.identity.execution;
    assert.equal(execution.collection, 'school-scene'); assert.equal(typeof execution.smoke, 'boolean');
    assert.ok(manifest.identity.conditions.every(c => c.parameters.collection_group === group), '路线报告不接受混合系列');
    const modes = new Set(manifest.identity.conditions.map(c => c.parameters.route_mode === 'cold' ? 'cold' : 'main'));
    assert.equal(modes.size, 1, '自然路线与首载实验不混合');
    const mode = [...modes][0];
    if (mode === 'cold') assert.equal(manifest.identity.conditions.length, 1, '首载各条件必须独立系列');
    assert.equal(execution.driver.version, manifest.versions.driver.version);
    assert.equal(digest(execution.driver), digest(manifest.versions.driver));
    assert.match(execution.driver.sha256, /^[a-f0-9]{64}$/);
    assert.equal(execution.injected_fault, null, '故障注入不是本路线实采');
    assert.equal(execution.gametick_ms, 1000); assert.equal(execution.heartbeat_ms, 1000);
    for (const [path, hash] of Object.entries(execution.source_files)) {
        assert.ok(!path.startsWith('/') && !path.split(/[\\/]/).includes('..'), '冻结路径不合法');
        assert.match(hash, /^[a-f0-9]{64}$/, '冻结元数据缺少摘要');
    }
    const attempts = readdirSync(join(directory, 'runs')).sort(); assert.ok(attempts.length > 0);
    assert.ok(attempts.every(name => statSync(join(directory, 'runs', name)).isDirectory()), '运行目录含未知文件');
    const evidence = new Map(), runs = attempts.map(name => verifyRun(directory, name, manifest, evidence));
    const rows = readSamples(directory, manifest);
    assert.equal(evidence.size, rows.length, '原件与台账数量不符');
    for (const row of rows) {
        assert.equal(row.condition_id, row.raw.condition_id); assert.equal(row.index, row.raw.index);
        assert.equal(row.outcome, row.raw.outcome); assert.equal(row.reason, row.raw.reason);
        assert.equal(evidence.get(key(row)), row.raw_sha256, '台账与原件不一致');
    }
    const conditions = manifest.identity.conditions.map(c => {
        const selected = rows.filter(row => row.condition_id === c.id);
        assert.equal(selected.length, c.samples, '路线样本尚未采满');
        assert.equal(new Set(selected.map(row => row.index)).size, c.samples);
        const effects = mingjiaoRouteEffects(selected, c);
        const known = selected.filter(row => ['observed', 'refused'].includes(row.outcome));
        const complete = effects.unknown === 0;
        const sum = select => complete ? known.reduce((n, row) => n + select(row.raw), 0) : null;
        const finalEnvironments = {};
        for (const row of known) {
            const env = row.raw.route_final.environment;
            finalEnvironments[env] = (finalEnvironments[env] ?? 0) + 1;
        }
        return { id: c.id, samples: c.samples, variant: c.parameters.variant, route_mode: c.parameters.route_mode,
            load_order: c.parameters.load_order, effects,
            command_execution_cost: sum(raw => raw.route_steps.filter(s => s.kind === 'command')
                .reduce((n, s) => n + s.accepted, 0)),
            resources_net_cost: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'].map(name =>
                [name, sum(raw => raw.before[0][name] - raw.after[0][name])])),
            letters_created: sum(raw => new Set(raw.route_steps.flatMap(s => s.after.letters)
                .map(letter => letter.object)).size),
            final_environments: finalEnvironments,
            evidence: selected.map(row => ({ index: row.index, raw_sha256: row.raw_sha256,
                preparation: row.raw.route_preparation, steps: row.raw.route_steps,
                final: row.raw.route_final, cleanup: row.raw.route_cleanup })) };
    });
    return { format: 1, kind: 'mingjiao-route', collection_group: group, fingerprint: manifest.fingerprint,
        smoke: execution.smoke, route_mode: mode, directory, versions: manifest.versions,
        reviewed_source_hash: mingjiaoRouteReviewedSourceHash,
        evidence_digest: digest(rows.map(row => [row.condition_id, row.index, row.raw_sha256])),
        runs, conditions, reader_sha256: sha256(readFileSync(fileURLToPath(import.meta.url))) };
}

export function mingjiaoRouteMarkdown(report) {
    assert.equal(report.kind, 'mingjiao-route'); assert.equal(report.collection_group, group);
    const lines = ['# 明教密道路线观察', '', report.smoke ? '仅烟雾，与正式系列分开。' : '冻结条件正式记录，不代表完整自然养成。', '',
        report.route_mode === 'cold' ? '首载顺序是实验准备的原 load_object 调用，不是玩家行走；每项独立驱动。'
            : '初始属性及位于明教密洞为实验准备；后续使用原玩家命令，不预先加载全部密道。', '',
        'observed 只表示原流程记录完整；开门、行走到达、拒绝和书信归属按原状态分别核验。', '',
        '| 条件 | 样本／核验／未知 | 命令／受理／拒绝 | 原返回成本 | 内力支出 | 开门动作／关门动作 | 实际行走 |',
        '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
    const number = value => {
        if (value === null) return '未观察';
        assert.ok(Number.isFinite(value), '缺资料不补零');
        return Number(value.toFixed(3));
    };
    for (const c of report.conditions) {
        integer(c.samples);
        const e = c.effects; integer(e.validated); integer(e.unknown);
        lines.push(`| ${text(c.id)} | ${c.samples}/${e.validated}/${e.unknown} | ${number(e.commands)}/${number(e.commands_accepted)}/${number(e.command_refusals)} | ${number(c.command_execution_cost)} | ${number(e.neili_cost)} | ${number(e.door_openings)}/${number(e.door_closings)} | ${number(e.moves)} |`);
    }
    lines.push('', '| 条件 | 原等待次数／实际秒 | 自然关闭观察 | 新书／收到同书 | 新信 | 最后房间（已核验记录数） |',
        '| --- | ---: | ---: | ---: | ---: | --- |');
    for (const c of report.conditions) {
        const e = c.effects;
        lines.push(`| ${text(c.id)} | ${number(e.waits)}/${number(e.wait_elapsed)} | ${number(e.callbacks_closed)} | ${number(e.books_created)}/${number(e.books_received)} | ${number(c.letters_created)} | ${text(JSON.stringify(c.final_environments))} |`);
    }
    lines.push('', '| 条件 | 气血／有效气血／精神／有效精神／内力净支出 | 已核验命令结果频数 |',
        '| --- | --- | --- |');
    for (const c of report.conditions) lines.push(`| ${text(c.id)} | ${['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']
        .map(k => number(c.resources_net_cost[k])).join('/')} | ${text(JSON.stringify(c.effects.results))} |`);
    if (report.route_mode === 'cold') {
        lines.push('', '| 独立首载条件 | 冻结准备顺序（非玩家命令） |', '| --- | --- |');
        for (const c of report.conditions) lines.push(`| ${text(c.id)} | ${c.effects.validated ? '' : '实际未观察；计划：'}${text(c.load_order.join(' → '))} |`);
    }
    lines.push('', '最短入密室为9条原命令；natural条件再ketou/get/go south/go out，共13条。最后go out在0号甬道拒绝，不表示已逃离密道。',
        '原5秒回调只关闭密洞enter出口，不是整段通关时限；原等待不直接调用close，不修改游戏时钟。',
        'midao9北去密室，但密室南回midao0；门状态不假设互逆。不把受理成本当内力费用，不计算DPS或武学强弱。',
        '书为原单例、信为原克隆；同对象从密室到USER的转移不算又生成一本，落点与领取分别保留。',
        '门开关与自然关闭计数由已经严校的前后门／出口状态派生，不声称额外观察过create或回调函数内部；净资源和原内力收费分别展示。',
        '频数仅来自已核验记录；混入错误或不适用时总计为未观察，不把未知记录补成拒绝、零消耗或零效果。',
        '', `证据摘要：${report.evidence_digest}`, '');
    return lines.join('\n');
}
