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

`AI_CLIENT_D` 通过本机 UDP 9999 发送 UTF-8 JSON。业务字段保持平铺，公共层添加 `type` 和 `request_id`；不能在 `payload` 中覆盖这两个字段。原 mapping 不被修改，不要求玩家在线。

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
| `timeout` | 90 | 整数秒，1–300 |
| `retry_delay` | 5 | 整数秒，1–60 |
| `retries` | 1 | 0–2；0 表示不重传 |
| `validator` | 无 | 可选 `function(mapping response)`，真值接受回包 |

重传沿用同一编号和序列化内容，不越过截止时间。未知选项会被拒绝。调用方只能取消自己的请求；取消成功返回 1，取消不触发回调。

## 响应与生命周期

- 数据报上限 8192 字节，总待处理上限 256，每个调用对象最多 64；满额立即返回 `busy`。
- 只接受配置地址发来的报文，检查编号、类型、大小及可选业务校验。类型须等于请求类型或 `error`；业务校验失败继续等待。
- 完成、超时、取消和 `remove()` 重载清理都先释放请求和定时器，再交付结果。回调异常不会阻断其他请求。
- 记录原调用对象及函数回调；对象销毁后不重新加载同路径对象。失效请求会在回包、重传、下一次提交或超时检查时清理。
- 发送与重传前检查 socket 状态及所有者；UDP 读错误导致驱动关闭 socket 后自动重新绑定，无需重载游戏守护程序。
- 重复、迟到和旧实例回包忽略。`remove()` 向仍有效的调用方报告 `unavailable`，关闭 socket。游戏的 `destruct()` sefun 会调用此钩子。
- 公共层不解释任务状态；将来业务返回“已受理”时，仅代表本次请求结束，后台任务是否完成由业务约定。

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
- 5 秒后重传一次，90 秒未收到回复提示超时；通信重载提示重新提问。

成功聊天回包含 `response`；错误回包含 `code`、`error`。AI 输出仅是文字，不执行游戏指令或发放奖励。

## Python 扩展点

`ai/main.py:create_server()` 明确组装业务：NPC 的 `chat`、`memory`、`config`，以及世界的 `world_describe`、`world_status`。世界短请求默认独立 2 个线程、3 秒处理预算，后台模型另用单 worker，不占 NPC 容量。完整业务契约见 [无限世界 AI 创作](../systems/illusion-world-ai.md)。

新增能力在组装处调用：

~~~python
server.register(
    ("my_request", "my_status"),
    service.process_request,
    max_workers=2,
    timeout=10,
    close=service.close,
)
~~~

这是扩展示例，当前没有 `my_request` 路由。处理函数签名为 `process_request(request, deadline)`，返回可 JSON 编码的 dict。公共层补响应类型与原请求编号；处理方校验业务字段、检查单调时钟截止时间、处理持久化和重复请求。

每组注册共享自己的有限线程池，监听线程不等待模型。NPC 使用 `MAX_WORKERS` 和 `REQUEST_TIMEOUT`；其他能力单独指定，不争用 NPC 会话锁。公共层仅合并同一来源地址、编号及内容的在途重传；完成后的去重必须由业务实现。

模型调用使用 `ai/src/llm.py` 的 `create_chat_client(settings)`、`complete_chat(settings, client, messages, deadline=..., timeout=..., max_tokens=..., operation=...)`。业务自行提供提示词；`operation` 只是日志标签。模型失败抛 `ModelUnavailable`，`code` 可为 `unconfigured`、`timeout`、`api_error`、`empty`、`truncated`。

模型单次超时取显式上限与剩余业务期限的较小值。NPC 整轮预算不超过 80 秒；公共模型入口不把其他能力限制在此预算内。HTTP 超时按网络操作执行，处理方仍需拒绝迟到结果；线程池不会强制中断 Python 函数。

公共模型错误另携带安全的 `status_code` 与 `retry_after` 元数据，世界 worker 用于 429 退避；不将供应商错误正文透传给玩家。可选 `usage_callback` 接收供应商返回的整数 token 计数，世界模块按尝试保存可取得的计数；无 usage 时不推算费用。

组件关闭自己创建的客户端，外部注入的客户端由注入方关闭。服务停止先等待工作结束，再关闭业务资源；日志仅记录模型、主机、耗时和错误分类，不输出密钥、提示词或 SDK 错误正文。

## 验证

~~~powershell
ai/.venv/Scripts/python.exe -m unittest discover -s ai/tests -v
node ai/scripts/test_lpc.mjs
~~~

LPC 测试默认使用 `bin/driver.exe`，可传驱动路径与 Python 路径：
`node ai/scripts/test_lpc.mjs /path/to/driver /path/to/python`。
独立临时 mudlib、随机本机端口、模拟模型，不读写真实玩家数据，不调用外部模型。测试编译真实客户端及适配层，并用原 NPC 聊天入口验证普通和影子调用。

真实游戏验收另行执行：

~~~text
talk butong 武当派如何拜师？
talk li bai about 你好
aitest li bai about 如何拜师？
~~~

确认提问后显示一次等待提示，回答送达原玩家；连续提问有忙碌提示。停止 AI 后应在 90 秒内提示超时，恢复服务后可再次交谈。真实聊天会使用模型额度并保存正常对话。
