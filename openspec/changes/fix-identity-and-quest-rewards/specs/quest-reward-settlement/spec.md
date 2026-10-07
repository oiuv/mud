# Spec Delta

## Purpose

定义铁匠、宝镜和运送任务的奖励结算边界，确保正常交付有对应奖励、失败可以重试，避免已完成任务却未领取实物或因玩家离线和昏迷丢失数值奖励，不建立历史补发机制。

## ADDED Requirements

### Requirement: Item reward failure preserves the unfinished task

铁匠和宝镜任务 SHALL 在实物奖品成功交到玩家手中后才确认完成及发放本次数值奖励。超重或普通移动失败 SHALL 拒绝结算，保留原任务进度、交付物和数值，提示整理行囊后重试；MUST NOT 自动将奖品落地、强制超重入包或虚报成功。

#### Scenario: Smith reward is too heavy
- **WHEN** 打铁次数足够但无法携带乾坤石
- **THEN** 任务仍在待办且未标记完成，经验、潜能、阅历不变，奖品不遗留在无环境状态

#### Scenario: Capacity becomes sufficient
- **WHEN** 同一玩家整理行囊后再次完成铁匠任务
- **THEN** 成功领取一次乾坤石及原规则数值奖励，任务完成；重复询问不重复领奖

### Requirement: Mirror milestones commit only after delivery

宝镜 SHALL 保留原奖池及各条目权重、数值公式和每 500 次循环。里程碑交付失败 MUST NOT 扣交付物、增加任务计数、发数值或银两、重置累计数；重试 MUST NOT 利用奖品重量差异筛选奖励品种或重复领奖。

#### Scenario: A milestone fails and is retried
- **WHEN** 累计第 100、200、300、400 或 500 次任务因携带不足被拒绝后重试
- **THEN** 失败时物品、任务轮次、累计数及奖励不变；成功时只交付一次并更新一次，500 次重置仅在成功后发生

#### Scenario: An ordinary mirror task completes
- **WHEN** 不到实物里程碑的合法宝镜交物完成
- **THEN** 保持原计数、数值奖励及银两处理方式，不凭本次修复改变普通任务奖额

### Requirement: Accepted deliveries settle numeric rewards immediately

运送任务 SHALL 在有效货物被接受的同次处理内结算对应经验、潜能和阅历，沿用现有每次交货基础公式及公共奖励衰减、上限。延迟对白 MUST NOT 承担资产结算，玩家随后退出、断线或昏迷 MUST NOT 丢失或重复获得该次奖励。

#### Scenario: A player leaves after delivering goods
- **WHEN** 玩家交货后在原延迟窗口内退出并重新登录，或昏迷后恢复
- **THEN** 接受货物时已获得相应数值，恢复后没有待补发或重复发放，正常退出保存包含奖励

#### Scenario: Several deliveries finish the quest
- **WHEN** 多次连续交货，包括最后一批，期间经验跨越奖励衰减阈值或潜能达到上限
- **THEN** 每次按当次结算状态应用原公式，货物与奖励各处理一次，任务不因等待已取消的奖励回调而无法结束
