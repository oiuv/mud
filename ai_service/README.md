# AI NPC集成指南

## 快速创建新的AI NPC

### 1. 配置NPC角色
编辑 `ai_service/config/npc_roles.json`，添加新NPC配置：

```json
{
  "your_npc_id": {
    "name": "NPC显示名称",
    "title": "NPC称号",
    "role": "角色类型",
    "personality": "性格描述",
    "background": "背景故事",
    "greeting": "初次见面问候语",
    "topics": ["话题1", "话题2", "话题3"],
    "speech_style": "说话风格",
    "knowledge_base": ["知识领域1", "知识领域2"]
  }
}
```

### 2. 创建NPC文件
复制模板文件并修改配置：

```bash
cp u/mudren/npc/ai_npc_template.c clone/npc/你的npc名.c
```

### 3. 修改NPC配置
在你的NPC文件中修改以下内容：

```lpc
// 修改这些配置项
set_name("张三", ({"zhang san", "zhangsan", "zhang"}));
set("title", "江湖游侠");
set("long", "这里写NPC描述...");
set("ai_npc_id", "zhang_san");  // 必须与json中的键匹配
set("ai_topics", ({"武功", "江湖", "美食"}));
```

### 4. 放置NPC
将NPC放置到游戏世界中，在房间文件中添加：

```lpc
// 方法一：在房间create函数中设置
void create() {
    ::create();
    set("short", "房间名称");
    set("long", "房间描述...");
    set("objects", ([
        "/clone/npc/你的npc名" : 1,     // 单个NPC
        "/clone/npc/另一个npc" : 2,     // 多个相同NPC
    ]));
    setup();
}

// 方法二：管理员动态添加
// 管理员可以使用：clone /clone/npc/你的npc名
```

## 改造现有NPC为AI

### 1. 添加AI配置
在现有NPC的create()函数中添加：
```lpc
set("ai_npc_id", "zhou butong");  // 对应json中的键名
```

### 2. 添加AI对话入口
在现有NPC中添加：
```lpc
int accept_talk(object me, string topic) {
    string player_id = me->query("id");
    string player_name = me->name();

    mapping context = ([
        "time": NATURE_D->game_time(),
        "location": environment(this_object())->query("short"),
        "weather": NATURE_D->outdoor_room_description()
    ]);

    if (!topic || topic == "") {
        topic = "你好";
    }

    AI_CLIENT_D->send_chat_request(
        query("ai_npc_id"),
        player_id,
        player_name,
        topic,
        context
    );

    return 1;
}
```

## 配置示例

编辑文件：`ai_service/config/npc_roles.json`

### 1. 江湖侠客
```json
{
  "li bai": {
    "name": "李白",
    "title": "诗剑双绝",
    "personality": "豪爽仗义，嫉恶如仇",
    "background": "行走江湖二十载，剑下斩尽不平事",
    "topics": ["武功", "江湖", "正义", "剑客"]
  }
}
```

### 2. 商人NPC
```json
{
  "wang zhanggui": {
    "name": "王掌柜",
    "title": "商会会长",
    "personality": "精明能干，善于经商",
    "background": "经营百年老店，见多识广",
    "topics": ["生意", "商品", "行情", "各地特产"]
  }
}
```

## 相关文档
- **AI_CLIENT_D**：`/adm/daemons/ai_client_d.c` - 游戏内AI客户端守护程序，处理NPC与Python服务端的通信
- **talk指令**：`/cmds/std/talk.c` - 玩家talk命令实现，用于与AI NPC对话

## 测试命令

游戏内使用以下命令测试：
```
talk npc_id 测试消息
```

## 注意事项
1. **ai_npc_id** 必须与json配置中的键完全一致
2. 重启AI服务后配置生效


## 服务端使用

### 1. 配置环境变量
```bash
cd ai_service
echo "OPENAI_API_KEY=你的月之暗面API密钥" > .env
echo "OPENAI_BASE_URL=https://api.moonshot.cn/v1" >> .env
echo "OPENAI_MODEL=moonshot-v1-auto" >> .env
echo "DASHSCOPE_API_KEY=你的千问API密钥" >> .env
```

### 2. 初始化知识库
```bash
# 基础关键词搜索
python scripts/setup_basic.py

# 千问向量搜索（推荐）
python scripts/setup_qwen.py
```

### 3. 启动服务端
```bash
python main.py          # 正常模式
python main.py -d       # 调试模式（显示详细日志）
```

## 性能优化（可选）
高频查询场景可启用查询向量缓存，减少API调用次数。参考实现：
```python
# 在 QwenKnowledgeSystem 类中添加查询向量缓存
self.query_vec_cache = {}  # 内存缓存，或替换为Redis
```
