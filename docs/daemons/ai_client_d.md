# AI_CLIENT_D — 通用 AI 请求客户端

实现：`adm/daemons/ai_client_d.c`；NPC 适配：`adm/daemons/ai_npc_d.lpc`（`AI_NPC_D`）。
服务配置与运行方式见 [AI 服务指南](../../ai/README.md)。

## 通用请求

~~~lpc
varargs mapping send_request(string requestType, mapping payload,
                             function callback, mapping options);
int cancel_request(string requestId);
int query_pending_count();
~~~

`AI_CLIENT_D` 通过本机 UDP 9999 发送 UTF-8 JSON。业务字段保持平铺，公共层添加 `type` 和 `request_id`；`request_mode`、`request_token` 同样是保留字段，不能在 `payload` 中覆盖。原 mapping 不被修改，不要求玩家在线；业务需要在线状态时提供存活回调。

返回含 `request_id` 的 mapping 表示已发送。立即失败返回 `type="error"`、`code`、`error`，不再调用回调。已发送请求由 `callback(mapping response)` 接收至多一次终态，字段由业务定义；公共错误包含 `type="error"`、`request_id`、`code`、`error`。

~~~lpc
void receive_config(mapping response) {
    if (response["type"] == "error") {
        // 按业务需要处理失败；不要把后台请求当作 NPC 对话输出。
        return;
    }
    // 使用 response["config"]。
}

void request_config() {
    mapping result;

    result = AI_CLIENT_D->send_request(
        "config", ([ "npc_id": "li bai" ]), (: receive_config :),
        ([ "timeout": 10, "retries": 0 ])
    );
    if (!stringp(result["request_id"])) {
        // 立即失败，没有待处理请求，也不会触发 receive_config。
    }
}
~~~

| 选项 | 默认值 | 约束 |
| --- | --- | --- |
| `timeout` | 90 | 仅短请求，整数秒 1–300；不能与 `long=1` 同时指定 |
| `retry_delay` | 5 | 整数秒，1–60 |
| `retries` | 1 | 0–2；0 表示不重传 |
| `validator` | 无 | 可选 `function(mapping response)`，真值接受回包 |
| `long` | 0 | `1` 显式选择长任务，服务端也须注册支持 |
| `alive` | 无 | 可选无参数函数；玩家/NPC 等业务对象仍有效时返回真值 |

重传沿用同一编号和序列化内容，不越过截止时间。未知选项会被拒绝。调用方只能取消自己的请求；取消成功返回 1，取消不触发回调。

## 长任务协议

新版 NPC 聊天显式选择 `long=1`，可选 `agent_run` 同样支持长模式，不设任务总等待上限；`memory/config`、世界受理/状态查询和未指定长模式的旧请求仍为短请求。升级时同时更新 Python 服务和两个游戏守护程序，不单独部署一侧。

长请求由公共层添加 `request_mode="long"` 与本次 `request_token`。服务端以来源地址、请求编号、完整报文指纹关联在途工作，返回：

~~~json
{"type":"request_progress","request_id":"...","request_token":"...","heartbeat_seconds":5,"lease_seconds":30}
~~~

这不是最终回答，不进入业务 validator/终态回调，也不创建模型调用或成功记录。客户端收到有效在途报文后，每 5 秒发送 `{type:"request_control", request_id, request_token, action:"renew"}`；服务端独立于模型输出确认存活，30 秒未收到有效续约即撤销资格。客户端也在 30 秒无有效在途消息后结束等待。此窗口容忍短暂丢包，不是任务总时限。首次握手沿用有限原报文重传；握手后只续约，服务重启返回 `request_gone`，不会因续约自动重新收费执行。

终态仍使用原业务类型或 `error`，附相同 token。丢失终态时续约可取得最多 60 秒、受 `REQUEST_CACHE_SIZE` 和 8192 字节报文上限约束的内存重放；NPC 持久成功去重另按原缓存契约处理。客户端只交付一次终态，同编号不同内容拒绝，取消后的续约不能复活任务。token 仅防关联错误，不是管理员认证；仍以受信任本机游戏客户端为边界。

服务端在发送终态前，原子地移除在途记录并登记终态缓存；此后即使工作线程尚未清理，续约或同内容重传也重放终态，不再把已完成请求报告为执行中。

取消发送 `action:"cancel"` 并停止续约；即使取消报文丢失，服务端也会独立失联停机。玩家离线、原 NPC 或回调宿主失效时遵循同一路径。服务停止会先撤销长请求，再等待已发出的 I/O 收尾、记账并关闭资源；不能强杀底层线程，迟到结果不用于后续操作或成功提交。`alive` 为假时会清理并向仍有效的回调宿主交付 `cancelled`，业务决定是否需要显示。

无需本 MUDLIB 的标准库客户端在 [`ai/scripts/example_socket.py`](../../ai/scripts/example_socket.py)。默认仅预览，明确发送需加 `--execute`；长聊天另加 `--long`。函数 `request(..., cancelled=threading.Event())` 支持调用方撤销，KeyboardInterrupt 同样尝试取消；不要在失败后自动生成新请求编号重跑收费任务。

## 响应与生命周期

- 数据报上限 8192 字节，总待处理上限 256，每个调用对象最多 64；满额立即返回 `busy`。
- 只接受配置地址发来的报文，检查编号、类型、大小及可选业务校验。类型须等于请求类型或 `error`；业务校验失败继续等待。
- 完成、超时、取消和 `remove()` 重载清理都先释放请求和定时器，再交付结果。回调异常不会阻断其他请求。
- 记录原调用对象及函数回调；对象销毁后不重新加载同路径对象。失效请求会在回包、重传、下一次提交或超时检查时清理。
- 发送与重传前检查 socket 状态及所有者；UDP 读错误导致驱动关闭 socket 后自动重新绑定，无需重载游戏守护程序。
- 重复、迟到和旧实例回包忽略。`remove()` 向仍有效的调用方报告 `unavailable`，关闭 socket。游戏的 `destruct()` sefun 会调用此钩子。
- 公共层仅解释上述存活协议，不解释业务状态；世界返回“已受理”时，本次短请求结束，后台任务是否完成由业务约定。

## NPC 兼容入口

~~~lpc
varargs string send_chat_request(string npcId, string playerId, string playerName,
                                string message, string context);
~~~

现有 NPC 继续调用 `AI_CLIENT_D->send_chat_request(...)`。薄入口把原 NPC 对象一并传给 `AI_NPC_D`，影子对象据此取得实际 NPC 名称。

NPC 适配层负责：

- 查找并保存原玩家对象，同玩家、同 NPC 防重复；最多 64 个在途聊天。
- 提问不超过 1000 字符，成功发送后返回“处理中...”。等待提示在玩家提问回显之后，仅显示一次。
- 校验回包 NPC/玩家 ID 和文本字段，再按原玩家对象展示。玩家退出或对象更换，不把旧回复发给新登录对象。
- 保存原玩家与 NPC 对象，检查玩家仍在线且 `find_player()` 仍是原对象；每 5 秒维持长请求。健康通信不因超过 90 秒放弃，失联/重载提示重新提问，离线或对象替换不显示旧回复。

成功聊天回包含 `response`；错误回包含 `code`、`error`。AI 输出仅是文字，不执行游戏指令或发放奖励。

## Python 扩展点

### 可选主 Agent

服务配置 `MAIN_AGENT_ENABLED=true` 后才注册 `agent_run`，默认关闭；未知请求、`chat` 和世界接口不会隐式转交主 Agent。使用通用 `send_request("agent_run", payload, callback, ([ "long": 1, "alive": ... ]))` 接入，游戏仍负责选择可信身份、业务授权、在线对象及展示。本次未自动替换现有 NPC/幻境玩法入口。

业务字段如下（传输层仍单独添加 `type/request_id/request_mode/request_token`）：

| 字段 | 说明 |
| --- | --- |
| `player_id` | 必填，由受信任宿主确定的玩家标识；不授予管理员权限 |
| `goal` | 必填，目标正文，不超过 `MAX_MESSAGE_CHARS`，上限 1000 字符 |
| `npc_id` | 可选，已启用角色配置中的 NPC；绑定当前玩家的该角色会话 |
| `context.situation` | 可选，有界游戏情境（最多 1600 字符） |
| `context.world` | 可选，宿主授权并绑定的 `world_describe` 业务载荷，仍需原世界校验/开关 |

不接受 `admin`、工具授权或任意额外字段。主 Agent 可直接处理简单目标，复杂专业目标按需委派；内部摘要不开放。`npc_id` 不是随便一个在线对象名，游戏须检查玩家有权与该角色交互。本机 UDP 只面向可信游戏适配进程，不提供网络认证，不应直接暴露给玩家客户端。

终态示例：

~~~json
{"type":"agent_run","request_id":"example-001","status":"completed","answer":"少侠有礼。","receipts":[]}
~~~

长模式另附关联 token。`needs_input` 表示需要补充信息，`incomplete` 表示目标未完成；技术失败沿用 `error`。`answer` 为玩家正文，`receipts` 是宿主处理的世界凭据，不能直接打印给玩家。`accepted/pending` 不代表正文完成；凭据沿原 `world_status` 查询，不创建另一套后台任务协议。

请求内成果引用只在服务内解析，不传给游戏。仅完整成功响应进入独立 `agent_run` 命名空间的持久缓存；有效期内原编号、相同输入/身份/权限重放不会再次调用模型，同号不同内容返回 `request_conflict`。未完成、取消和错误不作为持久成功缓存；业务已提交的子成果不会因父未完成被回滚。旧 NPC 缓存及路由保持兼容。

独立 Python 示例及费用/有限重试说明见 [`ai/scripts/README.md`](../../ai/scripts/README.md)。它无需导入 AI 服务内部模块或本库游戏对象；`test_router.py` 通过真实本机 UDP 验证主入口、澄清终态、成功重放及旧短查询，模型为离线替身。

### 注册其他能力

`ai/main.py:create_server()` 明确组装业务：NPC 的 `chat`、`memory`、`config`，以及世界的 `world_describe`、`world_status`。世界短请求默认独立 2 个线程、3 秒处理预算，后台模型另用单 worker，不占 NPC 容量。完整业务契约见 [无限世界 AI 创作](../systems/illusion-world-ai.md)。

新增能力在组装处调用：

~~~python
server.register(
    ("my_request", "my_status"),
    service.process_request,
    max_workers=2,
    timeout=10,
    close=service.close,
    long_types=("my_request",),  # 可选；my_status 仍是短查询
)
~~~

这是扩展示例，当前没有 `my_request` 路由。短处理函数签名为 `process_request(request, deadline)`；启用长请求后还须接受关键字参数 `lifetime`，长模式 `deadline=None`。处理方把 `lifetime.alive` 绑定到根 `Budget(alive=...)`，通过上下文检查共享给子调用；等待业务锁及提交前后也须核验。公共层剥离传输字段，业务校验、持久化和成功去重仍由处理方负责，返回可 JSON 编码的 dict。

每组注册共享自己的有限线程池，监听线程不等待模型。NPC 使用 `MAX_WORKERS`，其短模式使用 `REQUEST_TIMEOUT`；其他能力单独指定，不争用 NPC 会话锁。公共层合并同一来源地址、编号及内容的在途重传，长终态另有有界内存重放；跨重启成功去重必须由业务实现。

模型业务通过 `ai/src/runtime/Runner` 执行 Agent，底层统一使用 `ai/src/llm.py:ChatModel`；专业提示词维护在 `ai/skills/`，检索使用共享工具，直接预加载同样经过唯一的 `skill` 工具。新增业务不要直接调用旧 `complete_chat()` 或检索 handler 绕过策略、预算和 Hook。接入契约见 [服务架构](../architecture/ai-service.md)。

NPC 使用多轮 `npc_dialogue`，摘要使用单次 `conversation_summary`，共享用量、存活与取消；世界独立使用单次 `world_narration` 和原持久队列。候选通过 `runner.commit(outcome, callback)` 提交后才发运行完成事件。旧 NPC 业务字段不变：澄清/未完成可返回游戏语境的 `response`，但不写入成功历史、关系与去重记录；失败返回安全错误。外部请求自称管理员或指定 scope 不授予权限。

模型单次超时使用显式 I/O 上限；仅旧短请求/独立业务尝试另取剩余期限。通用长任务不设累计时长期限，单次工具超时反馈给 Agent 调整方法；底层超时操作未退出前仍占其容量/互斥门，不强制中断 Python 函数，不交付该操作的迟到结果。

公共模型错误与运行结果保留安全的 `status_code`、`retry_after`，世界 worker 用于 429 退避；不将供应商错误正文透传给玩家。用量经共享预算累加，世界模块按尝试保存可取得的 token 计数；迟到或无效响应同样计入实际用量，无 usage 时不推算费用。

组件关闭自己创建的客户端，外部注入的客户端由注入方关闭。服务停止先取消在线长任务，待已发出的操作结束后关闭业务资源；日志仅记录模型、主机、耗时和错误分类，不输出密钥、提示词或 SDK 错误正文。

## 验证

~~~powershell
ai/.venv/Scripts/python.exe -m unittest discover -s ai/tests -v
node ai/scripts/verify_lpc.mjs
~~~

LPC 测试默认使用 `bin/driver.exe`，可传驱动路径与 Python 路径：
`node ai/scripts/verify_lpc.mjs /path/to/driver /path/to/python`。
独立临时 mudlib、随机本机端口、模拟模型，不读写真实玩家数据，不调用外部模型。测试编译真实客户端及适配层，并用原 NPC 聊天入口验证普通和影子调用。

隔离回归不代表实际游戏验收；真实聊天会使用模型额度并保存正常对话。
