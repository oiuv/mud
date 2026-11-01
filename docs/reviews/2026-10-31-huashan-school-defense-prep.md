# S6 华山门派级防御（多攻击类型）窗口准备

日期：2026-10-31。状态：设计定稿，条件与运行器接线待连续重施窗口收尾后进行（避免修改运行中批次输入）。不修改游戏源码、数值或存档。

## 一、缺口

S6 的“门派级防御”指华山整体防御配置在不同攻击类型下的逐条表现，不是单一技能：`独孤九剑防御不等于华山整体防御`（2026-10-22 处置），且“间接验证无逐条效果证据，不能闭账”（2026-10-24 复核）。既有证据边界：

- `school-huashan-defense-*`（独孤九剑单技能）已覆盖多兵器类型（none/blade/pin/xsword）与等级边界，但防守方是独孤配置，不能外推华山门派防御。
- 旧短时交锋 200 场（复用核验过）只有固定剑类攻击、紫霞增益发动 0，不含增益下的防御表现。
- 三档自然到期/连续重施窗口只观察增益自身生命周期，无攻击。

## 二、窗口设计（`school-huashan-school-defense-{type}-l{level}`）

防守方（右方）为华山门派配置：`zixia-shengong` 内功、`huashan-jian` 剑法/招架、`huashan-shenfa` 身法，等级 200/400/800，持原测试剑；**先经原 `exert powerup` 建立紫霞增益**（复用 emei-zhao 的 powerup 前置模式，前置独立快照与扣费），再建立实验敌对。

进攻方（左方）为中性测试主体，攻击类型按原兵器类别：`sword`、`blade`、`pin`、`none`（徒手），各类型使用原普通攻击轮（TYPE_REGULAR，保留反击与原随机）。

逐条记录：原攻击轮的命中/落空/招架/伤害、防守方 dodge_checks 与 apply/defense 增量（含紫霞 +level/3）、busy/资源毛账、前置施放的受理与 100 内力支出。每条件正式 100（随机轮），烟雾 2；等级 200/400/800 × 四类型 = 12 条件。

预期为 observed（轮次发生）；不比较类型强弱、不排名、不补资源；单轮不代表完整交锋或胜负。

## 三、验收（严格消费者）

- 前置：`powerup` 步骤受理、+level/3 attack/defense、扣 100、`powerup` 标记在位；拒绝时不进入攻击并单列。
- 攻击轮：`attacks`/`defenses`/`dodge_checks` 与进攻类型一致（武器 skill_type 或徒手），防守方增益保持不被轮次撤回；反击按原分支记账。
- 结束态：增益仍由原 `remove_effect` 计时管理，本窗口不等到期（到期已由连续重施/到期窗口覆盖），轮次后快照保留 `powerup` 标记与增量。

## 四、失败尝试（保留不改写）

- `smoke-s6-school-defense-20261031`：进攻方技能表误设不存在的基本技能 `pin`（`F_SKILL: No such skill (pin)`），24 条全部样本错误；发簪类兵器由原兵器自身带动攻击轮，不虚构同名基本技能。
- `smoke-s6-school-defense-v2-20261031`：消费者误以 `launches=0`（沿用无前置的独孤防御口径），而原增益前置本身是一次原发动；改为核 `launches=1`（zixia-shengong/powerup）。两目录原件保留。

## 五、来源

`kungfu/skill/zixia-shengong/powerup.c`、`kungfu/skill/huashan-jian.c`、`kungfu/skill/huashan-shenfa.c`、`adm/daemons/combatd.c`、`feature/action.c`、`feature/damage.c`、`inherit/weapon/{sword,blade,pin}.c`、`cmds/skill/perform.c`/`cmds/skill/exert.c`；具体 hash 由条件生成时校验。
