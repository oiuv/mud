# G7 范遥 NPC/玩家 prepare 配对关联（2026-10-27）

> 按 tasks.md 4.2 G7 要求：补范遥 NPC 与玩家 prepare 对照。
> 本表关联已有 NPC 与玩家数据，非整组重采。

## 数据来源

| 来源 | 系列 | 条件 | 样本 | 内容 |
| --- | --- | --- | --- | --- |
| NPC 自动准备 | smoke-g7-fanyao-compare-20261027 | school-mingjiao-npc-bout-fanyao | 2 | 原 NPC 心跳执行战斗聊天闭包 |
| 玩家 prepare | repair-g7-fanyao-prepare-20261027 | 两种名称顺序、两种逐项追加顺序 | 8 | 原玩家命令，均到达双准备状态 |
| 组合资格接口 | 同上 | 两方向 valid_combine | 4 | 接口观察，不执行 prepare |
| 玩家攻击轮 | 同上 | 两方向单备、双备 | 8 | 单备 4 条、双备 4 条；不是 NPC 配对交锋 |

## 范遥技能配置

- **NPC 源码**：`kungfu/class/mingjiao/fanyao.c:68–72` 在 `chat_msg_combat` 中配置两个 `prepare_skill` 闭包，由原 NPC 心跳和聊天流程随机选择执行；不是 `F_COAGENT` 提供自动准备。
- **玩家 prepare**：`prepare nianhua-zhi sanhua-zhang` → preparations = `{finger: nianhua-zhi, strike: sanhua-zhang}`

## 配对对照

| 维度 | NPC（原 NPC 对白/自动准备） | 玩家（手动 prepare） | 一致性 |
| --- | --- | --- | --- |
| finger → nianhua-zhi | 源码 prepare_skill 配置 | prepare 命令 | ✅ |
| strike → sanhua-zhang | 源码 prepare_skill 配置 | prepare 命令 | ✅ |
| 初态 preparations | 空（战斗中自然准备） | 空 → prepare 后填入 | — |
| 最终双准备映射 | 2 条原件的 npc_observation.after.preparations | 8 条 prepare 和 4 条双备攻击轮的 after[0].preparations | 一致 |
| 战斗表现 | 原 NPC 持剑交锋 | 另行配置的玩家徒手攻击轮 | 条件不同，不作等价结论 |

## 计数说明

- **NPC 范遥**：2 条（school-mingjiao-npc-bout-fanyao）
- **玩家相关子集**：20 条 = 4 条接口 + 8 条 prepare + 8 条攻击轮；其中接口和单备记录不能算作双准备命令验证。
- **明教通用组合总数**：56 条（含范遥子集 20 条，非全部为范遥配对）

## 限制

1. NPC 初态 preparations 为空，原 NPC 对白/自动准备在战斗中执行，非启动时预设
2. 玩家 prepare 为显式命令，NPC 为隐式自然准备
3. 两条 NPC 原件及玩家双备命令的最终 preparations 一致（finger→nianhua-zhi, strike→sanhua-zhang）；单备记录只含一项、接口记录保持空映射，不声称这 20 条全部到达双备。
4. 相关输入共 22 条烟雾记录，不是 22 场同条件配对试验，也不把 56 条明教组合记录全部算作范遥配对。
5. 两系列 source_fingerprint 均为 `8ae4d9c9eb8ac77c0fd3dc7a08010d230e522a96a5bdf0bbb90e8db0ebe6bdce`。NPC 原件为 `samples/school-mingjiao-npc-bout-fanyao.0.json` 和 `.1.json`；`npc_bout.chat_choices` 保留每次闭包执行前后的准备映射。

## 结论

范遥战斗聊天回调与玩家双备命令能够达到相同的最终准备映射。这项限定对照已有原件支持，无需整组重采；不证明战斗强度相同、任意时刻准备状态相同或整个门派采集已经完成。
