# 六门全武学 valid_learn 接口边界采集

## 结果与范围

完成全武学阶段首批接口组：抽髓掌、冷月神功、轩辕箭、药王妙术、笑傲江湖曲、点沧海六门的原 `valid_learn` 接口边界，共 **12 条件、24 正式样本**（10 观察／14 预期拒绝）、0 运行错误或残缺；独立烟雾 **24 条**先行确认。直接观察原接口返回与拒绝原句，不冒充教师传授或练功成功；预期值是待验证的当前行为，不代表设计正确。

| 条件对 | 结果 | 已知问题 | 实证 |
| --- | --- | --- | --- |
| 抽髓掌 strike 80/79 | 观察／拒绝 | MA-005.01 | 错拼键弱化相对门槛，绝对 80 门槛仍在（79 拒绝原句「掌法根基不足」） |
| 冷月神功 force 10/9 | 观察／拒绝 | MA-005.07 | FORCE 祖先仍要求基本内功 10；不以无关的 /kungfu/skill/force 替代 /inherit/skill/force |
| 轩辕箭 throwing 20/19 | 观察／拒绝 | MA-005.12 | 原暗器门槛 20 |
| 药王妙术 medical 100/99 | 观察／拒绝 | MA-005.13 | 原医术门槛 100 |
| 笑傲江湖曲 flute/qin | 拒绝／观察 | MA-005.10 | 两种真实乐器资格分开验证；不创建错拼技能键 |
| 点沧海 level 0/200 | 拒绝／拒绝 | MA-006 | 缺失玄馄饨前置时无论自身等级均拒绝，不虚构 xuan-huntun |

## 实际观察

- 全部 24 条接口调用真实发生（test_interface → 原 valid_learn），返回值与拒绝原句同源入册；观察类零状态变化（资源/技能/属性深度一致），拒绝类仅留命令提示痕迹（raw.reason 同源保存原文）。
- 错拼技能键（choushui-zhang/lenyue-shengong/xuanyuan-arror/yaowang-mishu/cuhixiao-jifa/xuan-huntun）在全部样本中保持缺席，不创建错误 ID。
- 拒绝原句实证：「你的掌法根基不足，无法练抽髓掌」「你的基本内功火候不够，不能学习特殊内功」「你的暗器技能不够娴熟…」「你的基本医术造诣太浅…」「在掌握更娴熟的吹萧技法或弹琴技法之前…」。
- 接线期修工具自身问题三处（abilities 入口开放 case-prefix、条件补 not_applicable/observation 字段、notify_fail 临时标记的契约比较口径），均登记于验证记录；无游戏缺陷，MA 无新增（已知问题 MA-005.xx/006 为既有台账条目的实证补充）。

## 尚未完成

本组为全武学阶段（OpenSpec 5.x）首批接口样本；其余公共 `/kungfu/skill` 的 valid_learn/valid_research/valid_enable 等接口、11 件公共演奏、20 件纯继承条目及各类回调按后续批次推进。门派维度的 27 组仅教学门派战斗能力亦待采。本批不改游戏、不调整数值、不提交部署。

## 可复核证据

- 系列指纹：`c4fe135fb6cce059e893f9b9b2e1a39a1c08c7560988db595fcf32f03dcf8440`。
- 正式系列：`C:\Users\oiuv\AppData\Local\Temp\mud-martial\skill-learning-f1`，累计 24/24、退出码 0、45.51 秒、验证错误 0。
- 独立烟雾：`skill-learning-smoke5`，24/24、44.84 秒；通过后才启动正式。smoke1–smoke4 失败系列（参数准入、字段缺口、notify_fail 比较）保留。
- 统计报告：`skill-learning-f1-report`（statistics.json/md）。
- 本次仅改离线采集工具（ability_cases/execution/learning_cases 聚合与校验、CLI 参数准入）；游戏运行期源码、mudcore 与正式数据未修改。全套离线自检通过。
