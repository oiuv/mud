# AI_CLIENT_D - AI服务客户端守护进程

## 概述
AI_CLIENT_D 是MUD游戏中的AI服务客户端守护进程，通过UDP协议与外部Python AI服务器通信，为游戏NPC提供智能对话能力。它仅负责数据收发，所有AI逻辑包括记忆、配置、对话生成都在Python AI服务中实现。

## 核心功能

### 数据收发
- **UDP通信**：通过UDP协议与AI服务实时通信
- **消息转发**：转发NPC对话请求到AI服务
- **响应分发**：将AI响应分发到对应NPC和玩家
- **错误处理**：网络异常时的容错机制

### 通信架构
- **客户端角色**：仅作为消息中转站
- **服务端角色**：Python AI服务处理所有智能逻辑
- **数据持久化**：记忆和配置存储在AI服务器中
- **永久记忆**：AI服务支持跨会话的永久记忆

## 通信协议

### 消息格式
- **协议类型**：UDP数据报
- **数据格式**：JSON格式
- **端口配置**：本地9999端口
- **字符编码**：UTF-8

### 请求消息类型
```json
{
    "type": "chat",
    "npc_id": "zhangsan_npc",
    "player_id": "lisi_player",
    "player_name": "李四",
    "message": "你好",
    "context": {}
}
```

### 响应消息类型
```json
{
    "type": "chat",
    "response": "少侠你好！有什么可以帮你的？",
    "npc_id": "zhangsan_npc",
    "player_id": "lisi_player"
}
```

## 主要接口函数

### 对话请求
```lpc
// 发送对话请求到AI服务
varargs string send_chat_request(string npc_id, string player_id, string player_name,
                               string message, string context);

// 参数：
// npc_id - NPC对象ID
// player_id - 玩家对象ID
// player_name - 玩家名称
// message - 玩家消息
// context - 上下文信息（可选）

// 示例：
AI_CLIENT_D->send_chat_request("shopkeeper", "player1", "张三", "你好");
```

## 网络通信

### 连接配置
```lpc
#define AI_SERVER_HOST "127.0.0.1"  // AI服务地址
#define AI_SERVER_PORT 9999         // AI服务端口
```

### 通信流程
1. **请求发送**：NPC调用send_chat_request()
2. **数据转发**：客户端转发到Python AI服务
3. **AI处理**：Python服务处理记忆、对话生成
4. **响应返回**：AI服务返回处理结果
5. **消息分发**：客户端将响应发送给玩家

## Python AI服务架构

### 服务端功能（ai_service/main.py）
- **UDPServer类**：处理UDP通信
- **消息处理**：chat/memory/config三种类型
- **记忆管理**：永久记忆存储
- **NPC配置**：动态配置管理
- **历史对话**：完整对话记录

### 核心模块
- **memory_store.py**：永久记忆存储
- **npc_manager.py**：NPC配置管理
- **history_manager.py**：对话历史管理

## 消息处理流程

### 客户端处理
```lpc
// 1. 接收玩家输入
void read_callback(int fd, mixed message, string addr)

// 2. 解析JSON响应
mapping response = json_decode(message)

// 3. 查找对象并发送响应
private void handle_chat_response(mapping response)
```

### Python服务端处理
```python
# 1. 接收UDP消息
server_socket.recvfrom(2048)

# 2. 处理AI逻辑
npc_manager.generate_response()

# 3. 更新记忆
memory_store.update_player_memory()

# 4. 返回响应
self.server_socket.sendto()
```

## 记忆系统

### 永久记忆（Python服务端）
- **玩家记忆**：每个NPC对每个玩家的独立记忆
- **关系系统**：亲密度、关系等级等
- **对话历史**：完整的历史对话记录
- **自动摘要**：记忆容量满时自动生成摘要

### 记忆容量配置
- **默认容量**：100条对话记录
- **禁用选项**：设置为0可禁用历史记忆
- **最小容量**：10条记录
- **自动清理**：达到上限时触发摘要生成

## 使用示例

### NPC集成
```lpc
// NPC对象中调用AI对话
void chat_with_player(object player, string message) {
    string npc_id = query("id");
    string player_id = player->query("id");
    string player_name = player->query("name");

    // 发送请求到AI服务
    AI_CLIENT_D->send_chat_request(npc_id, player_id, player_name, message);
}
```

### 玩家交互
```lpc
// 玩家输入处理
void on_player_say(string message) {
    object npc = present("shopkeeper", environment(this_player()));
    if (npc) {
        npc->chat_with_player(this_player(), message);
    }
}
```

## 系统要求

### 运行环境
- **Python 3.x**：AI服务端运行环境
- **UDP端口**：9999端口必须可用
- **本地网络**：MUD与AI服务在同一主机

### 启动顺序
1. 启动Python AI服务：`python ai_service/main.py`
2. 启动MUD游戏：AI_CLIENT_D自动连接
3. 验证连接：通过NPC对话测试

## 调试与监控

### 客户端日志
```lpc
// 网络错误日志
debug_message("AI客户端: 发送失败")

// 响应异常日志
debug_message("AI客户端: 无效响应")
```

### 服务端日志
- **调试模式**：DEBUG环境变量控制
- **日志文件**：控制台输出所有请求/响应
- **错误追踪**：完整的异常堆栈信息

## 相关文件

### MUD端
- `/adm/daemons/ai_client_d.c` - 客户端守护进程
- `/include/socket.h` - 网络通信定义

### Python服务端
- `ai_service/main.py` - 主服务程序
- `ai_service/src/udp_server.py` - UDP服务器
- `ai_service/src/memory_store.py` - 记忆存储
- `ai_service/src/npc_manager.py` - NPC管理
- `ai_service/src/history_manager.py` - 历史管理

## 注意事项
- AI服务必须先于MUD启动
- 所有AI逻辑在Python服务端实现
- 客户端仅负责消息转发，不处理AI逻辑
- 记忆和配置永久存储在AI服务端
- UDP无连接特性：AI服务未启动时消息会丢失但无错误提示
- 支持多NPC同时对话，每个NPC有独立记忆

该架构实现了MUD与AI服务的松耦合，AI功能升级无需修改MUD代码。