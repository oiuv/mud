# Spec Delta

## Purpose

定义按游戏历法运行的世界活动如何计算目标时间、消费到期登记并安排下一周期，使活动不会因月底日期溢出提前出现，也不会因重复登记过去时点而反复提供奖励。

## ADDED Requirements

### Requirement: Relative event dates normalize across calendar boundaries

相对活动时间 SHALL 保留非负参数为增量、负参数为绝对分量以及月份从零计数的约定；结果 SHALL 按当前游戏时钟的历法进行小时、日期、月份和年份进位。活动 MUST NOT 因日期分量溢出而在目标小时之前触发。只有原来具有登记资格的对象才能注册，活动参数 SHALL 原样保留。

#### Scenario: Tomorrow at a fixed hour crosses a month end

- **WHEN** 月末登记明日五时或一时的活动
- **THEN** 目标是次月一日的对应小时，不因保存无效的月底加一日期而在次月零时提前触发

#### Scenario: Relative hours cross midnight and year end

- **WHEN** 最后一月最后一日二十三时登记一小时后的活动
- **THEN** 目标为下一游戏年一月一日零时，参数不变且到期只消费本次登记一次

#### Scenario: February and month increments use the game calendar

- **WHEN** 日期增量经过二月末，或月份增量超过最后一月
- **THEN** 结果符合游戏时钟实际采用的月长和年界，不假定每月三十天，也不把显示的游戏纪年直接当作现实公历年份

#### Scenario: Existing absolute components remain absolute

- **WHEN** 登记下一年八月十七日十二时的既有活动
- **THEN** 仍使用指定的月、日、时和下一游戏年，不改成最近一次活动、不另加一遍当前日时

### Requirement: Monthly events advance to their next occurrence

无量山玉壁剑舞 SHALL 安排严格晚于当前游戏时间的最近一次十五日二十三时；触发后 SHALL 登记后续月份的同一时刻，不补发已过去周期的奖励。到期登记 SHALL 在调用活动前被消费，同一登记 MUST NOT 因后续检查重复发奖。奖励资格、概率和数值 SHALL 保持原样。

#### Scenario: Registration occurs before this months event

- **WHEN** 当前游戏时间早于本月十五日二十三时并初始化剑舞活动
- **THEN** 登记本月该时刻，之前的检查不执行奖励

#### Scenario: Registration occurs at or after this months event

- **WHEN** 初始化或活动结束时，本月十五日二十三时已到或已过
- **THEN** 登记下月十五日二十三时；跨最后一月时进入下一游戏年，不用过去时点立即再登记

#### Scenario: Repeated checks follow an event

- **WHEN** 一次到期剑舞完成后连续检查，尚未到达下一次登记时间
- **THEN** 不再执行本周期的奖励抽取；到下一次登记时间才允许再执行一次，奖励本身不被削弱

### Requirement: Host game time advances continuously across years and restarts

宿主时钟 SHALL 在首次建立锚点时保留旧初始化公式的起始显示日期，并保存现实时间、内部游戏时间和纪年偏移。此后 SHALL 按原 1∶60 速率及内部公历连续推进，跨年时游戏年份正常递增；重启 SHALL 恢复同一锚点并计入停服经过时间，MUST NOT 重新取模重置日期。不修改玩家存档、mudcore 通用接口、时区或活动奖励，不补发停服期间周期奖励。

#### Scenario: Existing deployment initializes its first anchor

- **WHEN** 宿主启动时旧时钟记录没有时间锚点
- **THEN** 初始显示与旧公式在该时刻算出的日期一致，锚点经既有公共数据库保存，此后不再按现实日重新定年

#### Scenario: Production host clock crosses a year boundary

- **WHEN** 宿主内部时间从十二月最后一天二十三时推进到下一天
- **THEN** 游戏年增加一，月份和日期进入一月一日，已登记活动不提前并在目标时刻后只触发一次

#### Scenario: Restart resumes elapsed time

- **WHEN** 保存锚点后重启宿主，现实时间已继续经过
- **THEN** 恢复日期等于原锚点加经过现实秒数乘现有速率，不重复初始化月日；下一次无量山活动仍在未来
