# S6 连续重施窗口准备（叠加闸口 + 到期后重施）

日期：2026-10-31。状态：条件与运行器接线完成，烟雾／正式见后续结果页。不修改游戏源码、数值或存档。

## 一、缺口与既有证据边界

三档自然到期（`E/repair-s6-huashan-duration-formal-20261029`，12 条已终验，不重采）只关闭单次施放到期窗口。既有 `formal-s6-stacking-20261027` 虽名为叠加，其 24 条原件全部为**单次施放**（launches=1、无第二次尝试），并未实现条件说明中的“连续施放 2 次”；2026-10-29 终验页已如实记载“没有连续施放或叠加、到期后再次施放”，本窗口即补该具名缺口。

紫霞两入口原语义（`kungfu/skill/zixia-shengong/powerup.c`、`ziqi.c`，hash 已由现有测试钉对）：

- 活跃期重施：`powerup` 原句 `你已经在运功中了。`、`ziqi` 原句 `你已经在运起紫气东来了。`，均为 `notify_fail` 拒绝，不叠加、不再扣费。
- 到期后重施：原回调 `remove_effect` 撤回标记与增量后，再次施放按原闸口重新受理：再扣 100/200 内力、同增量重新生效、按原 `start_call_out(skill)` 重新计时；两窗之间不补内力、无残余增量。

## 二、条件设计（`school-huashan-qizong-{powerup,ziqi}-l{200,400,800}-s6-recast`）

每条件单条样本包含两个原窗口与一次活跃期重试：

1. 施放①（受理，+skill/3 攻防或 +skill/10 伤害/剑法，扣 100/200）；
2. 活跃期重施（预期原句拒绝，无增量变化、无二次扣费）；
3. 原 `remove_effect` 回调自然到期（level 秒，不缩时），完整撤回；
4. 施放②（受理，再扣 100/200，同增量重新生效）；
5. 第二次原回调自然到期，完整撤回。

- 正式：每条件 2 条（6 条件 12 条，双窗合计原计时约 94 分钟）；烟雾：仅 200 级每条件 1 条。
- `fighting: false`：交战分支会带原 busy（powerup 1+random(3)、ziqi 3），而 `exert` 的 busy 闸口先于活跃闸口，会把重施拒绝变成“上一个动作还没有完成”。交战 busy 行为已由既有交锋/施放窗口覆盖；本窗口专注重施闸口与双窗生命周期。
- 目标方保持中性配置；不补内力、不手工解除、不缩短原计时。

## 三、观察与验收（严格消费者）

在 `huashan-duration` 的既有 timed_effect 校验（原增量、费用、回调前后状态、到期不另扣）之上，重施条件另核：

- `active_repeat`：命令返回 0、`notify_fail` 含原活跃拒绝句、前后快照无任何增量/标记/资源变化；
- 双窗：`launches` 恰 2（均为原 zixia-shengong）、总费用 200/400、回调序列两轮 `[before, after]`，两轮 enter/exit 时序均满足“≥原级数、≤总时长”；
- 施放②前快照除内力已扣第一窗费用外与基线一致（增量/标记残余为零），施放②后增量与施放①一致、再扣原费用，第二次到期后增量回到基线且内力停留在两窗费用合计；两次到期均不追加扣费。

旧 `-s6-expiry`/`-s6-stacking` 系列原件与冻结校验不改写；`-s6-stacking` 保持单次施放史实，不借本窗口追认为叠加证据。

## 四、失败尝试（保留不改写）

- `smoke-s6-recast-20261031`：消费者第二窗到期内力基线误用第一窗值（5900 vs 实际两窗费用后 5800），首样本校验失败即中止；断言改为“第二窗到期与施放②后一致、不追加扣费”。
- `smoke-s6-recast-v2-20261031`：运行级看门狗预算只计单窗（530 秒 < 双窗约 808 秒），首样本 1/2 通过后 WATCHDOG 中止，收尾 ECONNRESET 记为 unexpected；预算按 `recast_after_expiry` 加计第二窗。两目录原件保留。

## 五、来源

- `kungfu/skill/zixia-shengong/powerup.c` `0dd7e762f7ac9fca0c6e3b00e117789b0dd2ce4ee0bba96fa5c9eac52701cf06`
- `kungfu/skill/zixia-shengong/ziqi.c` `eb0208d34600b734620ca360a8826b3e6628f147a2a5df94a76eeba37abdeccb`
- `cmds/skill/exert.c`（busy 闸口顺序）、`feature/action.c`/`mudcore/inherit/action.c`（原 `start_call_out` 回调）
