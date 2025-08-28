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

## 配置示例

### 1. 江湖侠客
```json
{
  "jianghu_xiake": {
    "name": "游侠李天",
    "title": "江湖游侠",
    "personality": "豪爽仗义，嫉恶如仇",
    "background": "行走江湖二十载，剑下斩尽不平事",
    "topics": ["武功", "江湖", "正义", "剑客"]
  }
}
```

### 2. 商人NPC
```json
{
  "merchant_wang": {
    "name": "王掌柜",
    "title": "商会会长",
    "personality": "精明能干，善于经商",
    "background": "经营百年老店，见多识广",
    "topics": ["生意", "商品", "行情", "各地特产"]
  }
}
```

## 测试命令

游戏内使用以下命令测试：
```
talk npc_id 测试消息
```

## 注意事项

1. **ai_npc_id** 必须与json配置中的键完全一致
2. **topics** 会影响NPC的对话风格和内容
3. 重启AI服务后配置生效
4. 每次对话都会更新亲密度和关系
