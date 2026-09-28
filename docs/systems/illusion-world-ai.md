# 无限世界 AI 创作

地图和玩法仍由 LPC 决定，AI 只写静态正文。正式内容采用独立的 `wuxia-v1` 版本，包含四种生态及旧村、残寺、荒渡、故关、废驿；正式世界与原测试世界分别冻结，旧存档不迁移、不重生成。入口是否开放以部署的运行配置和 `illusion status` 为准，实际验收范围见验证记录；文风优化与功能验收分开。最低驱动仍为 FluffOS v2026.0712.3，不涉及 mudcore 修改。

2026-09-28 已按维护者授权在本部署开放 `huanjing-v1`（种子 42），游戏入口和创作申请均开启，Python 服务在线。开服前备份在 `data/illusion_backups/pre-open-20260928/`；后续状态以实服为准，不代表所有部署默认开放，也不代表剩余综合验收已完成。玩家沿用子虚道人的“心魔幻境”入口；管理员可用 `illusion entry off` 将后续入场切回旧幻境，或只用 `illusion ai off` 暂停创作申请。

## 创作目标与审读标准

目标是让幻境更生动、自然、有地点辨识度和探索感。规则确定必要的地图与玩法事实，AI 可以补充未建模的景物细节；不要求每句话都有输入字段对应，也不以“只换一种说法复述模板”为目标。

- **鼓励合理发挥**：岩缝、盘根、局部陡坡、松脂气息、风声、凉意以及角力、敌影等文学比喻。判断是否符合上下文，未列入输入不是拒绝理由。
- **保持实际世界一致**：已知生态、场景身份、地标方位、道路和通行性不能被正文改写。“局部岩面陡峭”不等于道路被封死；归一化高程/温湿度和邻格高差也不是米、摄氏度或坡度角。
- **区分气氛与操作承诺**：“仿佛劲敌窥伺”可以烘托气氛；明确声称有可攻击伏兵、可拾取宝物、可进入暗道，则须有实际玩法依据。允许自然的感受性表达，不替玩家编造具体过往或已发生的动作。
- **区分环境意象与实时状态**：风声、松涛等可成为持久描写，不因涉及风就判错；不要与游戏已明确的时辰、天气状态冲突或捏造正在发生的状态变化。
- **分开评价质量与硬性错误**：先看自然性、武侠语境和阅读体验，再查真实事实冲突及误导操作。措辞浮夸、重复等属于可改进的文风，不自动升级为结构校验失败；发现实质冲突时记录具体冲突依据。

当前专业提示词位于 `ai/skills/world-narration/SKILL.md`，版本 `illusion-prose-v2`。`world_narration` Agent 通过统一 `skill` 工具直接预加载，不增加模型轮次；每次新生成任务记录实际加载版本，运行日志记录 hash。只影响后续创作，不改变事实 schema、内容键或已保存正文，不因升级自动重做或收费。格式/身份/安全校验继续执行；它们不承担完整自然语言语义审判。

## 运行流程与开关

真实在线玩家进入所属幻境房间时，若没有有效正文且满足限速，游戏通过 `AI_CLIENT_D` 提交事实。首次显示规则文案；Python 将任务提交 SQLite 后短确认，独立 worker 创作、校验、入库、原子发布 JSON。下一次 `look` 读取正文，不广播完成消息、不重载房间、不重生物品或心魔。

编译、预载、地图预览、NPC 移动和重复 `look` 不申请创作。玩家离开后任务仍可完成；同一世界坐标的文字由所有玩家共用，战斗实例仍独立。成功正文不因更换模型或提示词自动重做。

两个开关均默认关闭：

- 游戏管理员：`illusion ai on` / `illusion ai off`。只控制**新申请**，关闭时取消尚待确认的本地请求，已经入库的 Python 任务仍可能完成。设置保存到运行配置，重启后恢复；不影响已保存文字的读取。
- Python：`ai/.env` 中 `WORLD_ENABLED=true/false`，重启生效。缺 Key、缺共享世界目录或存储不可用只停用世界创作，不阻止 NPC 模块启动。彻底停止新增模型调用，应关闭游戏申请并停止服务，或将 Python 开关关闭后重启；已发出的调用需要等待结束。

`illusion status` 显示公共入口、申请开关、待确认数量、状态表与正文缓存。测试使用 `illusion enter test-...`，不要把 AI 开关当作公共入口开关。

### 管理入口与冻结

以下均为管理员命令；状态查看不创建房间、不请求模型。

| 命令 | 行为 |
| --- | --- |
| `illusion status 世界ID` | 查看不可变清单及摘要 |
| `illusion status 世界ID X Y` | 查看当前房间事实、内容键、有效落盘正文及本地申请状态 |
| `illusion init test-世界ID 种子` | 保留原测试初始化；相同清单幂等，不覆盖已有世界 |
| `illusion init 正式世界ID 种子 production` | 显式冻结正式清单；拒绝测试内容表和 `test-` ID，不自动开放入口或创作 |
| `illusion enter 世界ID` | 管理员进入指定世界检查，不改变公共入口 |
| `illusion entry 世界ID` / `illusion entry off` | 切换子虚道人后续入场的新旧入口，不搬移已有玩家 |

入口与游戏侧创作开关保存到 `data/illusion_world/runtime.json`，格式示例见 `adm/etc/illusion.example.json`。未配置时均关闭；启动预载会核对正式清单、内容表摘要与起点，再自动开放指定入口，不随机创建世界。配置损坏、清单缺失或版本失配时记录错误并退回旧入口；不会覆盖配置或存档。`illusion entry off` 同样持久保存，重启不会意外重新开放。外部修改配置后，管理员可调用 `illusion_world_d->reload_runtime()` 重新加载，保留在线实例；不要通过销毁世界守护程序刷新开关。

`catalog.json` 保持原 `test-v1` 字节不变，正式初始化选用 `catalog-wuxia-v1.json`。读取已有世界时按清单版本选表并核对摘要，两者可同时使用。内容表发布后不能原地修改影响事实的字段；新版本须独立清单和回退安排。正式部署使用 `illusion init huanjing-v1 42 production` 冻结，然后备份，最后 `illusion entry huanjing-v1`；初始化本身不开放入口。AI 可独立启停，无 AI 也能探索与离境。

房间诊断中的 `pending` 只表示等待本次短确认，`local_status=unknown` 表示本机没有保留申请记录，不证明后台没有任务或任务已完成。`saved=1` 只表示当前落盘正文通过读取校验。后台排队、运行、失败原因和额度以持久任务查询为准。

## 配置与容量

复用 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL` 和 `CHAT_EXTRA_BODY`，不使用 NPC 人设、记忆、聊天历史或知识检索。当前默认 `qwen3.8-flash`，关闭思考模式；这个默认值也适用于 NPC 问答和历史摘要，向量和重排模型不变。系统环境变量优先于 `.env`；路径相对 `ai/`，不是启动目录。已运行的 Python 服务须重启才会加载新配置。

| 配置/限制 | 默认值与含义 |
| --- | --- |
| `WORLD_CONTENT_DIR` | `../data/illusion_world`；先用游戏管理命令初始化测试世界，再启动创作服务 |
| `WORLD_TIMEOUT` / `WORLD_LEASE` | 90 / 180 秒；网络调用期间不持有数据库锁；超时回复拒绝 |
| `WORLD_SHORT_WORKERS` / `WORLD_SHORT_TIMEOUT` | 独立 2 线程 / 3 秒短请求预算；与 NPC 工作池分离 |
| `WORLD_QUEUE_LIMIT` | 256 个未完成任务；后台模型并发 1 |
| `WORLD_DAILY_LIMIT` | UTC 每日 300 次预留尝试；失败与重试计入，不是货币额度保证 |
| `WORLD_STORAGE_BYTES` / `WORLD_DISK_HEADROOM` | 1 GiB 软阈值 / 64 MiB 磁盘余量，另为在途任务留空间 |
| 游戏申请 | 每玩家会话每分钟 6 个新键；状态表 128、待确认 32、正文 LRU 256 |
| 消息 | 事实请求最多 6 KiB，公共数据报最多 8 KiB；10 秒等待、3 秒后最多重传一次 |

模型最多尝试三次，通常按 1 分钟、5 分钟退避；429 遵守更长的 `Retry-After`，并暂缓其他世界调用。聊天正在处理时不启动新的世界调用；已经开始的调用不强制取消。供应商的共享限流仍可能影响两类业务。

每次持久尝试进入统一运行时的 `single` 模式，最多一次模型调用；格式或引用不合格不在 Agent 内偷偷加调用。先得到候选，再经提交 Hook 和事务检查当前任务尝试、租约、冻结清单、停机与期限，入库成功后才发运行完成事件。发布失败只修复已保存正文，不重新调用模型；存储/队列仍属世界业务，不移入公共运行时。

使用进程文件锁禁止两个世界 worker 共用数据库。恢复遗留 `running` 任务须等待其租约；持久完成但未发布的任务只重新导出。模型返回到提交数据库之间崩溃可能补偿调用，不承诺外部调用恰好一次。

## 事实、身份与正文

`inherit/illusion/content.lpc` 与 `ai/src/world/protocol.py` 共同维护 v1 schema。有限事实包括生态、片区、地形、房间角色、默认文案、场景共有生态/主题/材质/状态，以及最多一个距离不超过 8 格的场景地标；方位由坐标决定，不代表直达出口或隔墙可见。

摘要采用固定字段顺序、UTF-8 字节长度前缀；整数为规范十进制。内容键为 `illusion-content-v1`、清单摘要、x、y、事实摘要的 SHA-256，不包含玩家或临时实例编号。两种语言用黄金向量及真实房间导出交叉验证，不对无序 JSON 直接散列。

响应状态为 `accepted`、`pending`、`ready`、`retry_later`、`failed`。`world_status` 只查询已有任务，可触发已完成正文重新发布，不创建模型任务。不同事实不能覆盖同一内容键。

模型只返回 `schema_version`、`description`、`used_fact_ids`。正文建议 120–240 汉字，硬限 360 Unicode 码点、1800 UTF-8 字节、至多两段；拒绝未知字段、重复 JSON 键、控制字符、代码围栏和非法地标引用。规则保留名称、出口、离境提示与对象列表。格式校验不能证明所有自然语言事实正确，真实文案仍须抽查。

## 数据与维护

- 主记录：`ai/data/world_content.db`，含世界身份、任务、正文、来源元数据和 UTC 调用计数。
- 发布文件：`data/illusion_world/content/<world_id>/<cx>_<cy>/<x>_<y>.json`。区块坐标向下取整；`x=-1` 属于 `cx=-1`。
- 冻结清单：`data/illusion_world/worlds/<world_id>.json`。
- 部署开关：`data/illusion_world/runtime.json`，与世界数据一起备份。

这些运行数据及 SQLite 辅助文件、进程锁均不提交 Git。`d/illusion/catalog*.json` 是手工内容规则，继续纳入版本控制。自定义 `DATA_DIR` 或共享目录时，运维须自行确保位于仓库外或已忽略路径。

从仓库根目录运行（Windows 可将 `python` 换为 `ai/.venv/Scripts/python.exe`）：

```sh
python ai/scripts/ops_world_content.py status
python ai/scripts/ops_world_content.py status --key CONTENT_KEY
python ai/scripts/ops_world_content.py status --world WORLD_ID --x 11 --y 1
python ai/scripts/ops_world_content.py status --world WORLD_ID --limit 100 --offset 0
# 以下写操作须停止 AI 服务，禁止与 worker 同时写入
python ai/scripts/ops_world_content.py repair --key CONTENT_KEY
python ai/scripts/ops_world_content.py retry --key CONTENT_KEY
python ai/scripts/ops_world_content.py quarantine --key CONTENT_KEY
python ai/scripts/ops_world_content.py backup /path/to/new-backup
python ai/scripts/ops_world_content.py restore /path/to/backup
```

`repair` 只导出已入库正文，不调用模型。备份前停止游戏的新世界初始化；备份通过 SQLite backup API 保存已提交事务，并复制清单与正文，最后写完成标记。恢复只接受完整备份及**尚不存在**的目标世界目录、数据库和辅助文件，拒绝覆盖现有数据。先调整配置指向空的恢复位置，验证后再切换部署；中途失败须人工处理保留的部分文件，不自动删除。不要仅复制运行中的 `.db` 而遗漏 WAL。

`status` 以只读连接访问数据库，可在服务运行时查询；按世界/坐标或内容键返回状态、坐标、尝试数、失败原因、发布标志、退避/租约时间与来源，同时显示最近七天 UTC 调用数及本次配置的限额。世界列表分页默认 100 条，上限 1000 条；空结果表示该查询未找到持久任务，不代表该坐标不可通行。

`retry` 是显式重排，不立即调用模型；服务下次启用时可能消费额度。仅接受未保存正文且尚未用完三次尝试的 `failed` 任务；保留已有次数、用量、最后错误及退避，不绕过队列、日额度、磁盘和冻结清单检查。达到三次上限或含已保存正文的人工隔离任务拒绝重排，不清零历史、不自动重生成；后者须另行审查。运行中的任务和普通 `retry_wait` 无需此操作，由原 worker 按既定退避处理。

`quarantine` 仅用于管理员已审定存在实质冲突的正文，不按关键词自动审稿。停止 AI 服务后，按准确的内容键将任务置为 `failed / content_quarantined`，原发布文件改名为同目录 `.quarantined-<内容键>.json`；数据库中的正文、来源、尝试数和用量全部保留。游戏下一次查看改用规则描写，房间、战斗和出口不变；后续访问、`repair`、`retry` 和服务重启均不会重新发布或生成该内容。隔离副本仍计入存储预算，并随原有备份/恢复保留。

隔离操作可以重复执行。若文件占用导致改名失败，命令返回失败，任务已经停止自动处理，但原文可能仍对玩家可见；排除占用后再次执行相同命令完成撤下，不要手工重排任务。原文件缺失或尚未发布时只保留数据库正文；遇到原文件与隔离副本同时存在则拒绝覆盖，须先人工核查。此命令不提供自动改稿或恢复发布，重新采用内容须单独审查和明确操作。

## 小预算真实效果试验

下述步骤会使用模型额度，自动测试不会执行。

1. 在现有测试世界中记录规则正文；不要改写其冻结清单。
2. 先采用离线单房间诊断：管理员执行 `illusion_content test-huanjing-m1 0 0`，将输出 JSON 保存到仓库外的 `room.json`。该命令不创建房间或调用模型。
3. AI 服务停止时执行以下命令，先检查，再显式允许最多一次调用：

```sh
python ai/scripts/ops_world_content.py describe /path/to/room.json
python ai/scripts/ops_world_content.py describe /path/to/room.json --live --max-calls 1
```

诊断仅接受 `test-` 世界；也可提供 1–30 个 payload 的 JSON 数组，`--max-calls` 限制本次执行尝试数（1–30）。它只执行本批键，不消费其他排队任务，仍受日预算与重试退避限制；检查输出状态，额度不足或处于退避时可能没有产生新正文。已有成功结果只复用，不再次收费。

诊断不修改 `.env` 的创作开关；未完成任务仍持久保存，日后启用世界服务时可能继续执行及有限重试。试验结束后保持 `WORLD_ENABLED=false`，不要把单次 CLI 的上限理解为这些任务的终身额度。

4. 返回同一坐标 `look`，比较规则版与新正文的沉浸感和辨识度，再检查真实空间冲突或误导操作，不能仅因新增细节而判废。扩大到规划中的 20–30 个房间前明确总调用预算，覆盖荒野、过渡、村口/井台与寺院相邻房间；显式换模型对照不自动覆盖已有正文。
5. 如需测试真实进入自动申请，设置 `WORLD_ENABLED=true` 和小的 `WORLD_DAILY_LIMIT`，启动服务，再执行 `illusion ai on`。结束后关闭两侧创作开关；已有文字仍可离线查看。

## 自动验证

```sh
python -m unittest discover -s ai/tests -v
node ai/scripts/verify_lpc.mjs
node tools/tests/test_illusion_world.mjs
# 可选正式地图扫描：20 个种子、每个 256 × 256 坐标及极值、乱序回读
node tools/tests/test_illusion_world.mjs --release
# 可选固定机器性能测量：严格区分区块/房间冷、热缓存和正文解析/命中
node tools/tests/test_illusion_world.mjs --bench
```

使用临时 MUDLIB、SQLite、随机环回端口和假模型，不消耗外部模型额度。真实调用结果与尚未完成的验收以 [验证记录](../../openspec/changes/add-wuxia-infinite-world/validation.md) 为准。

`--bench` 在基础回归后启动独立驱动，保存机器信息、128 组地图计时、257 组正文读取、LRU 峰值及 CPU 累计时间到临时目录 `data/benchmark.json`。冷缓存指 LPC 缓存未命中，不清空操作系统文件缓存；房间创建使用真实虚拟路由与房间代码、简化宿主，不代表完整玩家移动/战斗耗时。性能目标结果与功能检查分开报告；Windows 驱动无法提供有效 `eval_cost()` 差值时标记不可用，不把零差值解释为零开销。

Agent 迁移另有 `python ai/scripts/verify_business_agents.py` 合成资料联调，默认仅显示计划，授权后加 `--execute`。该脚本各提交一次 NPC 问答、摘要和世界任务；问答按目标执行，模型调用数以报告为准，不自动重跑失败批次。它使用临时世界与库，不操作下述测试世界的已有正文；结果见 [运行时验收记录](../architecture/ai-runtime-validation.md)。

## 当前模型与试看结果（2026-09-25）

三模型各一次的同房间对照中，`qwen3.8-flash` 为 2.39 秒，`qwen3.8-max` 为 3.89 秒，`qwen3.7-flash` 为 3.65 秒。Max 的景物表达更自然，Flash 已可试看；目前选择 Flash 作为速度与效果的阶段性折中，不将单样本视为稳定排名，也未进行同批 Max 对照或价格评测。

随后使用 v2 提示词和 Flash，为 `test-huanjing-m1` 的 6 间相邻松岗、9 间完整旧村及 5 间残寺各调用一次。20 次全部通过结构校验，平均 3.76 秒、P95 5.45 秒、最长 6.49 秒，合计 17,580 tokens，无重试。

- 19 份已审读正文写入主库并发布到测试世界；首次导出规则正文、发布后实际 `room->long()` 回读，各通过 104 项隔离驱动检查，不等同于实服操作验收。
- 残寺空院 `(-5,41)` 的“此处虽无真敌”可能否定实际心魔遭遇，保留原文和用量、停止该任务自动重试，不发布；该房间继续显示规则文案。这是一次性人工审读处理，不是已有通用审批功能。
- 主要质量问题为相邻开场和“角力/争胜”意象重复，少数句子复述约束、对当前房间角色着墨不足；合理补白、敌影比喻与风声仍允许，不以缺少对应字段判废。

在已加载本次代码的游戏中执行 `illusion enter test-huanjing-m1`，再 `east` 到 `(1,0)`、`look` 即可试看，不需要开启自动创作。起点 `(0,0)` 仍为规则正文；旧村范围为 x=`-62..-60`、y=`35..37`，残寺已发布 `(-4,41)`、`(-4,40)`、`(-4,42)`、`(-3,41)`。

上述 20 次预算及暂停安排是 2026-09-25 的阶段记录。2026-09-28 维护者确认 AI 断线旧回复不再投递，并授权恢复无限世界正式接入；后续状态见 [恢复顺序](../../openspec/changes/add-wuxia-infinite-world/tasks.md)。不为架构或提示词升级自动重生成这批正文。原运行证据位于忽略目录 `data/illusion_world/trials/v2-flash-20/`，不提交生成数据。
