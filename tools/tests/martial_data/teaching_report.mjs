// Read-only report for source-reviewed original NPC inquiries, not combat results.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput } from '../../collect_martial_data.mjs';
import { openSeries, readSamples, digest } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { validateRecord } from './execution.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { gumuSpecialTeachingEffects } from './gumu_special_teaching_cases.mjs';
import { gumuAcquisitionLearningEffects } from './gumu_acquisition_learning_cases.mjs';
import { gumuItemAcquisitionEffects } from './gumu_item_acquisition_cases.mjs';
import { gumuRecruitEffects } from './gumu_recruit_cases.mjs';
import { distribution } from './statistics.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const key = row => row.condition_id + '.' + row.index;

// A completed series freezes its own scope. Adding reviewed teachers must not
// invalidate an earlier batch or make that batch claim the newly added cases.
export function validateTeachingPlan(saved, current) {
    assert.ok(saved.length > 0, '教学计划为空');
    assert.equal(new Set(saved.map(c => c.id)).size, saved.length, '重复教学条件');
    const byId = new Map(current.map(c => [c.id, c]));
    for (const condition of saved) {
        assert.ok(byId.has(condition.id), '未核对的教学条件：' + condition.id);
        assert.equal(digest(condition), digest(byId.get(condition.id)),
            '已冻结教学条件与核对版本不同：' + condition.id);
    }
}

export function summarizeTeachingRows(manifest, rows) {
    const teachers = new Map(), conditions = [];
    for (const condition of manifest.identity.conditions) {
        const selected = rows.filter(r => r.condition_id === condition.id);
        assert.equal(selected.length, condition.samples, '教学条件尚未采满');
        assert.equal(new Set(selected.map(key)).size, selected.length, '重复教学样本');
        const steps = selected.flatMap(r => {
            assert.ok([].concat(condition.parameters.expected).includes(r.outcome), '实际授课终态与原条件不符');
            validateRecord(r.raw, condition);
            return validateTeachingRecord(r.raw, condition);
        });
        const p = condition.parameters;
        const summary = { id: condition.id, entry_id: condition.entry_id,
            kind: p.teaching_kind ?? 'ability_grant',
            teacher: p.teacher?.path ?? p.teaching_entry?.path ?? 'none', topic: p.topic, samples: selected.length,
            outcomes: { observed: selected.filter(r => r.outcome === 'observed').length,
                refused: selected.filter(r => r.outcome === 'refused').length },
            steps: steps.length, asks: steps.filter(s => s.command_kind === 'ask').length,
            gives: steps.filter(s => s.command_kind === 'give').length,
            learns: steps.filter(s => s.command_kind === 'learn').length,
            learning_steps: steps.filter(s => s.skill_advanced).length,
            advanced_steps: steps.filter(s => s.advanced).length,
            acquired_steps: steps.filter(s => s.acquired).length,
            ...(p.teaching_profile === 'gumu-special' ? {
                gumu_special: gumuSpecialTeachingEffects(selected, condition),
            } : {}),
            ...(p.teaching_profile === 'gumu-acquisition-learning' ? {
                gumu_acquisition_learning: gumuAcquisitionLearningEffects(selected, condition),
            } : {}),
            ...(p.teaching_profile === 'gumu-item-acquisition' ? {
                gumu_items: gumuItemAcquisitionEffects(selected, condition),
            } : {}),
            ...(p.teaching_profile === 'gumu-recruit' ? {
                gumu_recruit: gumuRecruitEffects(selected, condition),
            } : {}),
            ...(p.teaching_kind === 'formation_challenge' ? {
                challenges: steps.filter(s => s.challenge).map(s => s.challenge), variant: p.variant,
            } : {}),
            ...(p.teaching_kind === 'formation_invitation' ? {
                summons: steps.filter(s => s.summoned).length,
                monks_summoned: steps.reduce((n,s) => n + s.monks_summoned, 0),
                wait_still_reserved: steps.filter(s => s.wait_still_reserved).length,
                wait_seconds: distribution(steps.filter(s => s.wait_still_reserved).map(s => s.wait_elapsed)),
                variant: p.variant,
            } : {}),
            ...(p.teaching_kind === 'ordination' ? {
                kneels: steps.filter(s => s.command_kind === 'kneel').length,
                tonsured_steps: steps.filter(s => s.tonsured).length,
                permissions_acquired: steps.filter(s => s.permission_acquired).length,
                names: Object.fromEntries([...new Set(steps.filter(s => s.tonsured).map(s => s.new_name))].sort()
                    .map(name => [name, steps.filter(s => s.tonsured && s.new_name === name).length])),
                variant: p.variant,
            } : {}),
            ...(p.teaching_kind === 'promotion_quest' ? {
                fights: steps.filter(s => s.command_kind === 'fight').length,
                completed_fights: steps.filter(s => s.fight_completed).length,
                tokens_acquired: steps.reduce((n,s)=>n+s.token_acquired,0),
                letters_acquired: steps.reduce((n,s)=>n+s.letter_acquired,0),
                recruited_steps: steps.filter(s => s.recruited).length,
                fight_wait_seconds: distribution(steps.filter(s => s.fight_completed).map(s=>s.wait_elapsed)),
                variant: p.variant,
            } : {}),
            ...(p.teaching_kind === 'apprenticeship' ? {
                apprentices: steps.length, recruited_steps: steps.filter(s => s.recruited).length,
                variant: p.variant, recruit_category: p.recruit_category,
                command_accepted: selected.flatMap(r => r.raw.teaching).filter(s => s.command_accepted === 1).length,
            } : {}),
            ...(p.teaching_profile === 'feng' ? {
                learned_points_spent_per_step: distribution(steps.map(s => s.learned_points_spent)),
                ...(p.teaching_kind === 'weapon_knowledge' ? {
                    knowledge_trials: steps.filter(s => s.knowledge_trial).length,
                    knowledge_acquired: steps.filter(s => s.knowledge_acquired).length,
                    first_ask_trials: selected.filter(r => validateTeachingRecord(r.raw, condition)[0].knowledge_trial).length,
                    first_ask_acquired: selected.filter(r => validateTeachingRecord(r.raw, condition)[0].knowledge_acquired).length,
                } : {}),
            } : {}),
            contribution_spent_per_step: distribution(steps.map(s => s.contribution_spent)),
            ...(p.teaching_kind === 'introductory_teaching' && p.teaching_profile !== 'gumu-acquisition-learning' ? {
                balance_spent_per_step: distribution(steps.map(s => s.balance_spent)),
            } : {}),
            ...(['promotion_quest', 'formation_challenge'].includes(p.teaching_kind) ? {
                jing_net_spent_per_step: distribution(steps.map(s => s.jing_spent)),
                jing_cost_per_sample: distribution(selected.map(r => r.raw.metrics[0].jing_cost ?? 0)),
                jing_recovery_per_sample: distribution(selected.map(r => r.raw.metrics[0].jing_recovery ?? 0)),
            } : { jing_spent_per_step: distribution(steps.map(s => s.jing_spent)) }),
            ...(['quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'emei-teachers', 'gumu-teachers'].includes(p.teaching_profile) ? {
                skill: p.skill, level: p.level, teacher_level: p.teacher_level, variant: p.variant,
                learning_progress_per_step: distribution(selected.flatMap(r => r.raw.teaching.filter(s => s.command.startsWith('learn ')).map(s =>
                    (s.after.learned[p.skill] ?? 0) - (s.before.learned[p.skill] ?? 0)))),
                learned_points_spent_per_step: distribution(steps.filter(s => s.command_kind === 'learn').map(s => s.learned_points_spent)),
                command_accepted: selected.flatMap(r => r.raw.teaching).filter(s => s.command.startsWith('learn ') && s.command_accepted === 1).length,
                ...(p.teaching_profile === 'wudang' ? {
                    learning_jing_spent_per_step: distribution(steps.filter(s => s.command_kind === 'learn').map(s => s.jing_spent)),
                } : {}),
            } : {}),
            known_issue: p.known_issue,
            evidence: selected.map(r => ({ id: key(r), raw_sha256: r.raw_sha256 })),
        };
        conditions.push(summary);
        const teacherPath = p.teacher?.path ?? p.teaching_entry?.path ?? 'none';
        if (!teachers.has(teacherPath)) teachers.set(teacherPath, {
            path: teacherPath, group: teacherPath.split('/')[3] ?? 'none', topics: new Set(),
            conditions: 0, samples: 0, observed: 0, refused: 0, steps: 0, asks: 0, gives: 0, learns: 0, learning_steps: 0,
            advanced_steps: 0, acquired_steps: 0, issues: new Set(),
        });
        const teacher = teachers.get(teacherPath);
        teacher.topics.add(p.topic); teacher.conditions++;
        if (p.teaching_kind === 'apprenticeship') {
            teacher.apprentices = (teacher.apprentices ?? 0) + summary.apprentices;
            teacher.recruited_steps = (teacher.recruited_steps ?? 0) + summary.recruited_steps;
        }
        for (const field of ['samples', 'steps', 'asks', 'gives', 'learns', 'learning_steps', 'advanced_steps', 'acquired_steps']) teacher[field] += summary[field];
        teacher.observed += summary.outcomes.observed; teacher.refused += summary.outcomes.refused;
        if (p.known_issue) teacher.issues.add(p.known_issue);
    }
    assert.equal(rows.length, conditions.reduce((n, c) => n + c.samples, 0), '有不属于条件的样本');
    const groups = [...teachers.values()].map(t => ({ ...t,
        topics: [...t.topics].sort(), issues: [...t.issues].sort() })).sort((a, b) => a.path.localeCompare(b.path));
    const kinds = [...new Set(conditions.map(c => c.kind))].map(kind => {
        const selected = conditions.filter(c => c.kind === kind);
        return { kind, conditions: selected.length, samples: selected.reduce((n, c) => n + c.samples, 0),
            observed: selected.reduce((n, c) => n + c.outcomes.observed, 0),
            refused: selected.reduce((n, c) => n + c.outcomes.refused, 0) };
    });
    return { fingerprint: manifest.fingerprint, conditions, teachers: groups, kinds,
        totals: { teachers: groups.length, groups: new Set(groups.map(t => t.group)).size,
            topics: groups.reduce((n, t) => n + t.topics.length, 0), conditions: conditions.length,
            samples: rows.length, observed: groups.reduce((n, t) => n + t.observed, 0),
            refused: groups.reduce((n, t) => n + t.refused, 0),
            steps: groups.reduce((n, t) => n + t.steps, 0),
            asks: groups.reduce((n, t) => n + t.asks, 0), gives: groups.reduce((n, t) => n + t.gives, 0),
            learns: groups.reduce((n, t) => n + t.learns, 0),
            learning_steps: groups.reduce((n, t) => n + t.learning_steps, 0),
            ...(groups.some(t => t.apprentices) ? {
                apprentices: groups.reduce((n, t) => n + (t.apprentices ?? 0), 0),
                recruited_steps: groups.reduce((n, t) => n + (t.recruited_steps ?? 0), 0),
            } : {}) } };
}

export function readTeaching(directory) {
    directory = realpathSync(directory);
    const manifest = openSeries(directory);
    assert.equal(manifest.identity.execution.collection, 'teaching');
    assert.equal(manifest.identity.execution.smoke, false, '烟雾不能代替完整教学采集');
    const catalog = json(join(directory, 'catalog.json'));
    const relations = json(join(directory, 'school-relations.json'));
    assert.equal(catalog.source_fingerprint, manifest.identity.source_fingerprint);
    validateTeachingPlan(manifest.identity.conditions, teachingConditions(relations, catalog));
    const rows = readSamples(directory, manifest), evidence = new Map();
    const attempts = readdirSync(join(directory, 'runs'));
    assert.ok(attempts.length, '缺少驱动运行证据');
    for (const name of attempts) {
        const run = join(directory, 'runs', name), result = json(join(run, 'result.json'));
        assert.equal(result.process.code, 0, '驱动未正常结束');
        assert.equal(result.validation_errors.length, 0);
        assert.equal(result.incomplete_bytes, 0);
        const output = readFileSync(join(run, 'driver-output.txt'), 'utf8');
        assert.equal(sha256(output), result.driver_output_sha256);
        assert.match(output, /DATA COMPLETE/);
        const request = json(join(run, 'request.json'));
        assert.equal(request.fingerprint, manifest.fingerprint);
        const allowed = new Set(request.jobs.map(key));
        const log = readFileSync(join(run, 'mudlib/log/events.jsonl'), 'utf8');
        assert.ok(log.endsWith('\n'), '原始记录尾行不完整');
        for (const line of log.split('\n').filter(s => s.trim())) {
            const raw = JSON.parse(line), id = key(raw), hash = digest(raw);
            assert.ok(allowed.has(id), '原始记录不属于请求');
            assert.ok(!evidence.has(id) || evidence.get(id) === hash, '原始样本冲突');
            evidence.set(id, hash);
        }
    }
    for (const row of rows) {
        assert.equal(row.index, row.raw.index);
        assert.equal(row.outcome, row.raw.outcome);
        assert.equal(evidence.get(key(row)), row.raw_sha256, '原始日志与台账不符');
    }
    return { ...summarizeTeachingRows(manifest, rows), directory,
        evidence_sha256: digest(rows.map(r => [key(r), r.raw_sha256]).sort()) };
}

export function teachingMarkdown(report) {
    const t = report.totals;
    const lines = ['# NPC 教学采集结果', '',
        `系列：\`${report.fingerprint}\`；证据摘要：\`${report.evidence_sha256}\`。`, '',
        `${t.groups} 个目录分组、${t.teachers} 名教师、${t.topics} 条教师／主题组合，${t.conditions} 个条件、${t.samples} 条样本，实际交互 ${t.steps} 次（询问 ${t.asks}、交书 ${t.gives}、学习 ${t.learns}）。`,
        `有教学状态进展 ${t.observed} 条、完全未获进展 ${t.refused} 条；无进展可能是资格拒绝或原随机失败，按条件分别统计。`, '',
        '| 教师来源 | 主题数 | 条件数 | 样本数 | 有进展 / 无进展 | 询问 / 交书 / 学习 | 关联问题 |',
        '| --- | ---: | ---: | ---: | --- | ---: | --- |'];
    for (const teacher of report.teachers) lines.push(`| ${teacher.path} | ${teacher.topics.length}`
        + ` | ${teacher.conditions} | ${teacher.samples} | ${teacher.observed} / ${teacher.refused}`
        + ` | ${teacher.asks} / ${teacher.gives} / ${teacher.learns} | ${teacher.issues.join('、') || '—'} |`);
    if (t.apprentices) lines.push('', `另有原拜师命令 ${t.apprentices} 步，实际建立新师承 ${t.recruited_steps} 步；不计入询问／交书／学习列。`,
        '拜师资格可由实验初态提供，不能据此宣布推荐信、剃度或阵法自然流程已完成；同一师父再次请安不计新拜师。');
    lines.push('', '样本数及逐样本交互次数以冻结条件为准。确定性门槛通常独立重复两次，随机教学须单列试验次数和真实获授次数。',
        'weapon_knowledge 单列有效尝试、首次尝试、实际获授和潜能支出；同一学生第二次询问可能已学会或资源不足，不把整条链的获授比例当作单次成功率。',
        '有进展包括递进领悟和已知错误字段，不代表正常学会或能够施展。连续询问保留同一学生及原资源变化，只有明确配置跨教师的条件才更换教师。',
        'introductory_teaching 单列入门技能、共享许可、多个领悟及存款支出；跨教师交互按首个教师归组，具体每步教师见原始记录。',
        '学习许可单列为 learning_permission，只证明获得后续学习入口的许可，不证明技能已学会；ability_grant 记录原领悟写入。',
        'book_teaching 为原交书与询问链；交书取得许可后即使授课被拒也属于部分进展，是否获目标绝招须查看最后一步及原领悟字段。',
        'letter_teaching 经原询问获得书信后交信；取得物品是阶段进展，只有领悟字段实际增加才计入 acquired_steps。书信身份与持有者逐步核验，不由夹具发放；跨教师按首个教师归组。',
        'promotion_quest 单列实际令牌／推荐信、原切磋回调及晋升。精神支出、原心跳恢复和净下降分开，净下降可为负，不当作负收费。已有辈分和高等级配置是实验初态；不代表自然入门、门槛胜率或全部NPC已完成实测。详情见逐条件JSON。',
        'ordination 单列受戒许可、跪拜、实际剃度和法名分布；取得许可不等于已剃度，出家身份不等于新师承。姓名登记仅使用隔离数据，未复制正式姓名或表情存档；未受戒的 kneel 受理值只代表本隔离环境。',
        'formation_invitation 单列召集次数、实际罗汉身份和自然等待后占用；获准召集不代表已启动战斗或闯阵成功。超时缺陷按原计时观察，未经触发的后续挑战不计完成。',
        'formation_challenge 经原询问、移动与回调，单列出手者、最高计数、实际过阵标记、经验奖励、最终占用和出口；observed只表示流程已采集，不把失败或残留状态称作过阵成功。高气血实验不代表普通玩家的过阵胜率。',
        report.conditions.some(c => c.gumu_acquisition_learning)
            ? `技能成长共 ${t.learning_steps} 步，包含经核对的原 ask 首次设置黯然掌等级；口诀许可另计，不把原 ask 受理或精神费用当学习成功。`
            : `ordinary_learning 经原 learn 命令；${t.learning_steps} 步实际增加技能等级或学习进度，单独授予许可不计入此数。`,
        '范围以本系列冻结的条件清单为准；后续新增条件不计入本系列，也不合并为累计样本。',
        '只覆盖本组已核对交互，不代表该教师的全部普通学习、拜师、所有绝招或所在门派全部能力均已采集。',
        '逐条件状态、贡献／精神支出分布及原始记录引用保存在 JSON。游戏实现和玩家数据未修改。', '');
    if (report.conditions.some(c => c.gumu_special))
        lines.push('古墓13项原授招按询问、实际领悟、贡献支出、原技能奖励分别计数；重复询问继承状态，精神10–19仅记录实际值与源码支持区间，少量样本不代表完整随机分布。', '');
    if (report.conditions.some(c => c.gumu_acquisition_learning))
        lines.push('古墓口诀与首次启蒙区分首次获取、已知、业务拒绝及原ask精神不足拒绝；首次0→10是原set_skill，不是自然练成。贡献与ask精神分账，本组没有配置存款支出，不生成存款收费统计。', '');
    if (report.conditions.some(c => c.gumu_items))
        lines.push('古墓领物区分受理、库存份数、实际根数、玩家取得、落地、叠加销毁、已持有及拒绝；原ask精神费用单列。直接reset仅为准备接口，不证明自然补货；库存、容量和初始持有者是冻结实验输入。', '');
    if (report.conditions.some(c => c.gumu_recruit))
        lines.push('古墓拜师区分首次入门、同门转拜、重复请安、跨派确认、取消及资格拒绝；仅真实新师承计为进展。首次清贡献与持久／临时任务另计，旧师承保留及拒绝受理不等于拜师成功，不代表自然养成。', '');
    for (const kind of report.kinds) lines.push(`- ${kind.kind}：${kind.conditions} 个条件、${kind.samples} 条样本，有进展 ${kind.observed}、无进展 ${kind.refused}。`);
    lines.push('');
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        assert.ok(process.argv.length === 3 || process.argv.length === 4,
            '用法：node tools/tests/martial_data/teaching_report.mjs 系列目录 [新的仓库外报告目录]');
        const report = readTeaching(process.argv[2]), markdown = teachingMarkdown(report);
        if (process.argv[3]) {
            const output = newOutput(process.argv[3]);
            writeFileSync(join(output, 'teaching.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
            writeFileSync(join(output, 'teaching.md'), markdown, { flag: 'wx' });
            console.log('教学报告：' + output); console.log(JSON.stringify(report.totals));
        } else console.log(markdown);
    } catch (error) { console.error('教学报告失败：' + error.message); process.exitCode = 1; }
}
