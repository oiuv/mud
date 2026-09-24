# Spec Delta

## Purpose

为心魔幻境提供可长期探索与重访的武侠程序化世界，使同一种子下的地貌、生态、场景与道路保持一致。地图必须脱离外部 AI 服务独立运行，并支持有限资源下按需扩展，而不是预先创建所有房间。

## ADDED Requirements

### Requirement: Stable geographic identity
系统 SHALL 使用不可变的世界标识、生成规则版本、种子和二维坐标确定地理事实；同一世界的结果 MUST 不受玩家身份、访问顺序、全局随机调用、房间销毁或服务重启影响。运行中的个人战斗实例 MUST 与地理和文字存档身份分离。

#### Scenario: Revisit after cleanup
- **WHEN** 两名玩家以相反顺序访问同一批正负坐标，随后清理房间并重启驱动
- **THEN** 相同坐标的地貌、场景、名称、结构位置与出口一致，玩家的战斗对象仍彼此独立

#### Scenario: Geometry version changes
- **WHEN** 管理员启用不同生成规则、种子或地形内容表的新世界
- **THEN** 系统使用新的世界身份，旧实例仍引用原世界，不把旧描写匹配到新地形

### Requirement: Continuous terrain and biome regions
系统 SHALL 依据连续的地形和气候参数形成成片生态区域，地貌边缘 SHALL 具有可识别的过渡环境。计算区块边界 MUST 不构成可见的地貌硬切线；心理主题 SHALL 独立于地理生态，不使每个房间随机变换世界背景。

#### Scenario: Cross a forest boundary
- **WHEN** 玩家从湿润森林沿道路走向湿地
- **THEN** 沿途出现疏林、潮湿林缘等过渡事实，相邻房间的植被、水汽和地势描述与事实相符

#### Scenario: Cross chunk and negative-coordinate boundaries
- **WHEN** 玩家穿过计算区块边界或从坐标零走到负坐标
- **THEN** 地形和场景连续，结果与先生成相邻区块时一致

### Requirement: Multi-room scenes with shared facts
系统 SHALL 将村落、残寺等场景生成为具有统一名称、边界、地标及功能分区的多房间结构，按地貌适宜性与确定性间距布置。跨区块结构 MUST 保持统一身份，重叠候选 MUST 采用与访问顺序无关的处理规则。

#### Scenario: Explore an abandoned village
- **WHEN** 玩家从村口进入旧巷、井台与祠堂一带
- **THEN** 这些房间属于同一村落，共享村名、环境和地标，各自承担不同空间角色；祠堂与井台不会因先访问哪间房而换位

#### Scenario: Structure overlaps a computation boundary
- **WHEN** 一个场景跨越两个计算区块，玩家分别从两边进入
- **THEN** 系统生成同一结构，其房间、连接和事实没有重复、断裂或相互覆盖

### Requirement: Bidirectional connected movement
普通空间出口 SHALL 对称，所有可供玩家进入的房间和场景 SHALL 接入世界道路网络；系统 MUST 不生成没有离境或回程路径的孤立可进入区域。传送门是显式单向跨区域出口，不属于普通双向道路。

#### Scenario: Walk east and return west
- **WHEN** 玩家通过普通 east 出口从 A 到 B
- **THEN** B 的 west 出口返回同一实例中的 A，房间重载不改变这一关系

#### Scenario: Reach a remote scene
- **WHEN** 一个合法远端场景或跨区块道路被按需生成
- **THEN** 它接入既有连通网络，玩家能够沿普通路径到达离境点；地形障碍不会切断必要连接

### Requirement: Bounded lazy generation
系统 SHALL 仅按需要计算有限邻域并实例化实际需要的房间，具有有界内存缓存；地图移动 MUST 不等待网络响应。坐标计算 SHALL 明确支持负数，越出实现安全整数范围 MUST 明确拒绝并保持玩家在合法位置，不能溢出为其他坐标。

#### Scenario: AI service offline
- **WHEN** AI 服务未启动且玩家持续探索从未访问的坐标
- **THEN** 本地规则正常生成道路和默认描写，不出现依赖 AI 的移动等待

#### Scenario: Long exploration session
- **WHEN** 玩家访问超过缓存容量的区块后返回已淘汰区块
- **THEN** 缓存保持容量上限，按同一规则恢复原地形，不因缓存淘汰改变已保存描写
