// Read completed standard weapon series; never mutate samples or game sources.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, openSeries, readSamples } from './ledger.mjs';
import { summarizeSamples, distribution } from './statistics.mjs';
import { validateRecord } from './execution.mjs';
import { profiles } from './weapon_cases.mjs';

const names = { axe: '斧／盘古七势', blade: '刀／胡家刀法', club: '棍／金猿棍法',
    dagger: '短兵／惊月笔法', hammer: '锤／撼山锤法', pin: '针／辟邪剑法',
    spear: '枪／中平枪法', staff: '杖／打狗棒法', sword: '剑／华山剑法',
    throwing: '暗器／金蛇锥法', whip: '鞭／缠魂索', xsword: '箫／玉箫剑法' };
const json = path => JSON.parse(readFileSync(path, 'utf8'));

export function remainingBusy(state) {
    if (!state || !Object.hasOwn(state, 'busy')) return null;
    // CORE_ACTION starts with undefined (false/zero in LPC); this sefun encodes
    // it as null. Functions are serialized as strings and remain unknown.
    return state.busy === null ? 0 : Number.isFinite(state.busy) ? state.busy : null;
}

export function readWeapons(directory) {
    directory = realpathSync(directory);
    const manifest = openSeries(directory), conditions = manifest.identity.conditions;
    assert.equal(manifest.identity.execution.collection, 'weapons');
    assert.equal(manifest.identity.execution.smoke, false, '烟雾不是完整统计');
    assert.equal(conditions.length, 48);
    const level = conditions[0].parameters.actor.skills[conditions[0].parameters.profile.skill];
    assert.ok([200, 400, 800].includes(level));
    for (const profile of profiles) for (const method of ['ordinary', 'perform']) for (const jiali of [0, 50]) {
        const c = conditions.find(row => row.id === `${profile.type}-${method}-l${level}-j${jiali}`);
        assert.ok(c, '缺少类别/模式/加力条件');
        assert.equal(c.samples, 100);
        assert.deepEqual(c.parameters.profile, profile);
        assert.equal(c.parameters.actor.skills[profile.basic], level);
        assert.equal(c.parameters.actor.skills[profile.skill], level);
        assert.equal(c.parameters.actor.skills['martial-cognize'], level);
    }
    const records = readSamples(directory, manifest);
    assert.equal(records.length, 4800, '完整系列应有 4800 条');
    for (const row of records) {
        const condition = conditions.find(c => c.id === row.condition_id);
        validateRecord(row.raw, condition);
        assert.equal(row.outcome, condition.parameters.expected);
    }
    const summary = summarizeSamples(manifest, records);
    assert.ok(summary.conditions.every(c => c.missing === 0 && c.counts.error === 0 && c.counts.refused === 0));
    let imported = 0;
    for (const attempt of readdirSync(join(directory, 'runs'))) {
        const run = join(directory, 'runs', attempt), result = json(join(run, 'result.json'));
        assert.equal(result.process.code, 0, '批次有未处置的异常退出');
        assert.equal(result.validation_errors.length, 0);
        assert.equal(result.incomplete_bytes, 0);
        assert.match(readFileSync(join(run, 'driver-output.txt'), 'utf8'), /DATA COMPLETE/);
        imported += result.imported;
    }
    assert.equal(imported, 4800);
    return { directory, level, manifest, records, summary };
}

export function compareWeaponLevels(series) {
    assert.equal(series.length, 3);
    const sorted = [...series].sort((a, b) => a.level - b.level);
    assert.deepEqual(sorted.map(s => s.level), [200, 400, 800]);
    assert.equal(new Set(sorted.map(s => s.directory)).size, 3, '不能重复使用同一系列');
    const normalize = series => series.manifest.identity.conditions.map(c => {
        const parameters = structuredClone(c.parameters), p = parameters.profile;
        for (const key of [p.basic, p.skill, 'martial-cognize']) parameters.actor.skills[key] = '<level>';
        return { entry: c.entry_id, method: c.method, samples: c.samples, parameters };
    });
    for (const current of sorted.slice(1)) {
        assert.equal(digest(current.manifest.identity.execution), digest(sorted[0].manifest.identity.execution),
            '驱动/夹具或执行条件不同');
        assert.equal(current.manifest.identity.source_fingerprint, sorted[0].manifest.identity.source_fingerprint);
        assert.equal(current.manifest.identity.dictionary_sha256, sorted[0].manifest.identity.dictionary_sha256);
        assert.deepEqual(current.manifest.versions, sorted[0].manifest.versions, '版本不同');
        assert.deepEqual(normalize(current), normalize(sorted[0]), '成长档还改变了其他条件');
    }
    return sorted;
}

export function weaponMarkdown(series) {
    series = compareWeaponLevels(series);
    const f = value => value === null ? '未知' : value.toFixed(2);
    const lines = ['# 十二类兵器：单次效果与等级观察', '',
        '采集日期：2026-10-08。单次采样已完成；连续交锋与后续门派/全武学采集另行验收。', '',
        '每档 48 条件 × 100 次，共 14,400 条记录；每档 4,600 正常观察、200 暗器持器普攻不适用。',
        '仅为已列代表武学、固定中性目标及人工资格；不是所有同类武学、同养成成本或完整门派的比较。', '',
        '## 版本与证据', ''];
    for (const s of series) lines.push(`- ${s.level} 级：\`${s.directory}\`；指纹 \`${s.manifest.fingerprint}\`。`);
    lines.push('', `源码：\`${series[0].manifest.versions.commit}\`。`,
        '各系列保存相同的驱动、子模块、源码/夹具 hash；报告重新核对全部原始样本、资源账、退出结果及仅等级相关参数变化。', '',
        '## 实验配置与指定招式', '',
        '每档同时设置对应基础武学、特殊武学和武学修养。其余基本内功/轻功/招架为 600，未激发特殊内功、轻功和招架。',
        '固定目标基础剑法 200，基本内功/轻功/招架为 600；双方每样本重建，气血 10,000、内力 6,000、先天属性 30、经验 10,000,000、护甲 100。',
        '普通装备实验重量 3,000、名义伤害 50；箫经真实初始化为 45。暗器 10 枚，总重量 100，只 hand 不 wield。材质、坚硬度未额外补齐，不冒充真实最佳配装。', '',
        '| 类别／代表武学 | 实验激发 | 指定施展命令 |', '| --- | --- | --- |');
    for (const p of profiles) lines.push(`| ${names[p.type]} | \`${p.basic}\` → \`${p.skill}\` | \`perform ${p.basic}.${p.move}\` |`);
    for (const method of ['ordinary', 'perform']) for (const jiali of [0, 50]) {
        lines.push('', `## ${method === 'ordinary' ? '普通攻击' : '单次指定绝招'}，加力 ${jiali}`, '',
            '各格为“对方气血总支出／自身内力总支出”的样本均值；创伤、恢复及分布另存 statistics.json。', '',
            '| 类别／代表武学 | 200 级 | 400 级 | 800 级 |', '| --- | ---: | ---: | ---: |');
        for (const p of profiles) {
            const cells = series.map(s => {
                const c = s.summary.conditions.find(c => c.id === `${p.type}-${method}-l${s.level}-j${jiali}`);
                return c.counts.not_applicable ? '不适用' : `${f(c.sides[1].metrics.qi_cost.mean)}／${f(c.sides[0].metrics.neili_cost.mean)}`;
            });
            lines.push(`| ${names[p.type]} | ${cells.join(' | ')} |`);
        }
    }
    lines.push('', '## 控制与资源削减的补充观察', '',
        '下表只列零加力绝招，单格为“目标末尾整数忙乱均值／目标内力总支出均值”。',
        '末尾忙乱不是控制触发率或精确持续时长；连击可能打断先前控制。无伤害不能解释为无效果。',
        '原始 busy:null 是该夹具返回的未初始化忙乱值，按 CORE_ACTION 与 JSON 包装语义计为 0；缺键或函数忙乱仍为未知。', '',
        '| 类别／代表武学 | 200 级 | 400 级 | 800 级 |', '| --- | ---: | ---: | ---: |');
    for (const p of profiles) {
        const cells = series.map(s => {
            const id = `${p.type}-perform-l${s.level}-j0`, c = s.summary.conditions.find(c => c.id === id);
            const busy = distribution(s.records.filter(r => r.condition_id === id).map(r => remainingBusy(r.raw.after[1])));
            return `${f(busy.mean)}／${f(c.sides[1].metrics.neili_cost.mean)}`;
        });
        lines.push(`| ${names[p.type]} | ${cells.join(' | ')} |`);
    }
    lines.push('', '## 解读边界', '',
        '- 每档同时改变基础武学、特殊武学及武学修养；目标和其余条件固定。这是该组合的成长观察，不是某个参数的单变量因果估计。',
        '- 普攻没有激发特殊内功；加力内功钩子未执行。两档普攻的随机差异不等于加力收益，绝招直接结算另按原逻辑计费。',
        '- 部分代表武学的全局动作表在初始化时读取 this_player() 并计算随机系数。当前结果保留真实加载行为；首次加载上下文及缓存取值另待核验，不能解释为所有动作都逐击按当前角色重新计算。',
        '- 针、箫独立使用实际物品初始化；暗器为手持弹药，不伪装成可 wield 的剑。',
        '- 200/400 级打狗缠与金蛇吐雾在当前高轻功目标上有确定判定限制；独立低轻功机制样本不混入本表。',
        '- 玉箫「天地情长」的已知错误技能 ID（MA-001）未修复。200 级本档未削减目标内力，400/800 级仍可由剑法与内功部分通过判定；不能将局部加成错误说成整招失效。',
        '- 本报告只覆盖单次样本；交锋、完整门派、其他绝招与特殊配装另行采集，不据此调整强弱。', '');
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        assert.equal(process.argv.length, 5, '用法：node tools/tests/martial_data/weapon_report.mjs 200级目录 400级目录 800级目录');
        console.log(weaponMarkdown(process.argv.slice(2).map(readWeapons)));
    } catch (error) { console.error('兵器报告失败：' + error.message); process.exitCode = 1; }
}
