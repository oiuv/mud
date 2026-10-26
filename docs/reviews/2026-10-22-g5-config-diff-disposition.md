# G5 配置差异条件处置（2026-10-22）

## 背景

Codex 修复审查（2026-10-21）发现七个有历史有效样本的条件与当前工厂配置不完全一致。按修复报告要求，须明确复用理由或另采，不能混算。

## 七个配置差异条件

| # | 条件 ID | 差异内容 | 策略 | 处置 |
| --- | --- | --- | --- | --- |
| 1 | huashan-quan-huashan-zhang-l400-jiali0-ordinary | 旧领悟键 `huashan-zhang/piao` → 现 `huashan-quan/song` | ordinary | 复用有效 |
| 2 | nianhua-zhi-sanhua-zhang-l400-jiali0-ordinary | 旧领悟键 `sanhua-zhang/san` → 现 `nianhua-zhi/fuxue` | ordinary | 复用有效 |
| 3 | nianhua-zhi-sanhua-zhang-l400-jiali50-ordinary | 同上 | ordinary | 复用有效 |
| 4 | xuanfeng-tui-pikong-zhang-l400-jiali0-ordinary | 旧无 `qimen-wuxing`，现增 400 级 | ordinary | 复用有效 |
| 5 | xuanfeng-tui-pikong-zhang-l400-jiali0-perform | 同上 | perform | 复用有效 |
| 6 | xuanfeng-tui-pikong-zhang-l400-jiali50-ordinary | 同上 | ordinary | 复用有效 |
| 7 | xuanfeng-tui-pikong-zhang-l400-jiali50-perform | 同上 | perform | 复用有效 |

## 复用理由

### 领悟键变更（条件 1-3）

领悟键（`can_perform/<skill>/<move>`）仅在 perform 策略下被绝招发动检查读取。三个条件均为 **ordinary** 策略，不发动绝招，领悟键不参与任何战斗路径。键名变更不影响普通攻击、防御、心跳恢复或攻击轮计数。旧样本对 ordinary 策略的观察结果完全有效。

### qimen-wuxing 增加（条件 4-7）

`qimen-wuxing` 是 `luoying-shenzhang.zhuan`（第二组合绝招）的前置条件（≥120 级）。第一组合（xuanfeng-tui-pikong-zhang）的绝招为 `pikong-zhang.dai`，不依赖 `qimen-wuxing`。增加该技能到演员技能集不影响第一组合的战斗行为——它不在 preparations、mappings 或任何战斗路径中被引用。

具体分析：
- **ordinary 策略**（条件 4、6）：不发动绝招，`qimen-wuxing` 完全无关。
- **perform 策略**（条件 5、7）：发动 `pikong-zhang.dai`，不检查 `qimen-wuxing`。旧数据中 perform 正常发动，结果有效。

## 统计口径

- 旧样本保持原始冻结条件 hash，不与当前配置合并为同一分布。
- 当前配置下的采集（本轮全组重采）作为补充数据独立记录。
- 跨配置版本并集仅用于条件覆盖索引，不用于效果分布统计。

## 真正缺失条件（非配置差异）

以下条件此前完全无样本，本轮补采：

| 条件 ID | 计划样本 | 状态 |
| --- | ---: | --- |
| huashan-quan-huashan-zhang-l400-jiali50-ordinary | 20 | 本轮补采 |
| nianhua-zhi-sanhua-zhang-l400-jiali0-perform | 20 | 本轮补采 |
| nianhua-zhi-sanhua-zhang-l400-jiali50-perform | 20 | 本轮补采 |
| lanhua-shou-luoying-shenzhang-l400-jiali0-perform | 20 | 本轮补采 |
| lanhua-shou-luoying-shenzhang-l400-jiali50-ordinary | 20 | 本轮补采 |
| lanhua-shou-luoying-shenzhang-l400-jiali50-perform | 20 | 本轮补采 |
| taiji-jian-l400-jiali0 | 20 | 已完成（20/20） |
| taiji-jian-l400-jiali50 | 20 | 已完成（20/20） |

## 证据

- 旧样本保全于 `E/review-repair-20261021/`，冻结条件 hash 和执行版本记录在 `replay.json`。
- 本轮新采系列保存在 `C:/Users/oiuv/AppData/Local/Temp/mud-martial-*-20261022`。
- 配置映射仅比较运行条件（忽略 qualification_note 和 qualification_sources）；源码、原始条件和执行版本独立记录。
