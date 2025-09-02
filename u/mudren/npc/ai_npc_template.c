// AI NPC通用模板
// 快速创建新的AI NPC，只需修改配置部分即可

inherit NPC;

void create() {
    ::create();

    // ====== 配置部分开始 ======
    // NPC基本信息
    set_name("模板名字", ({"template_npc_id", "npc_id"}));
    set("long",
        "这里填写NPC的详细描述，包括外貌特征、性格特点等。\n"
        "指令：talk \u003cNPC名\u003e [内容] - 与NPC对话\n"
        "      ask \u003cNPC名\u003e about [话题] - 询问特定话题"
    );

    // 可选：AI配置（必须与config/npc_roles.json中的键匹配）
    set("ai_npc_id", "template_npc_id");

    // 可选：角色属性
    set("gender", "男性");
    set("age", 30);
    set("combat_exp", 50000);
    set("str", 20);
    set("int", 25);
    set("con", 18);
    set("dex", 22);
    // ====== 配置部分结束 ======

    setup();
    // 可选：携带物品
    // carry_object("/clone/weapon/xxx");
    // carry_object("/clone/misc/xxx");
}

// ====== 以下部分通常不需要修改 ======

// 必须：AI对话命令talk接口
int accept_talk(object me, string topic) {
    string npc_id = query("ai_npc_id") || query("id");
    string player_id = me->query("id");
    string player_name = me->name();
    string context;

    if (!topic || topic == "") {
        topic = "你好";
    }

    // 构造简洁灵活的上下文情境信息
    context = sprintf(
        "时间：%s | 地点：%s | 天气：%s\n"
        "玩家性别：%s | 玩家年龄：%s | 玩家称号：%s | 玩家门派：%s",
        NATURE_D->game_time(),
        environment(this_object())->query("short") || "未知",
        NATURE_D->outdoor_room_description(),
        me->query("gender") || "未知",
        me->query("age") ? sprintf("%d岁", me->query("age")) : "未知",
        me->query("title") || "无",
        me->query("family/family_name") || "无门派"
    );

    // 发送AI请求到中心化守护程序
    AI_CLIENT_D->send_chat_request(
        npc_id,
        player_id,
        player_name,
        topic,
        context
    );

    return 1;
}

// 可选：兼容ask命令
mixed accept_ask(object me, string topic) {
    return accept_talk(me, topic);
}

// 可选：主动打招呼
void greeting(object me) {
    accept_talk(me, "初次见面");
}

// 可选：心跳函数，可用于定时互动
void heart_beat() {
    object *players;
    object env = environment();

    if (!env) return;

    players = filter_array(all_inventory(env), (: userp :));
    if (sizeof(players) > 0 && random(100) < 5) {
        object player = players[random(sizeof(players))];
        greeting(player);
    }
}
