// AI NPC通用模板
// 快速创建新的AI NPC，只需修改配置部分即可

inherit NPC;

void create() {
    ::create();

    // ====== 配置部分开始 ====== 
    // 必需：NPC基本信息
    set_name("模板名字", ({"template_npc", "template"}));
    set("title", "模板称号");
    set("long", 
        "这里填写NPC的详细描述，包括外貌特征、性格特点等。\n"
        "指令：talk \u003cNPC名\u003e [内容] - 与NPC对话\n"
        "      ask \u003cNPC名\u003e about [话题] - 询问特定话题"
    );

    // 必需：AI配置（必须与config/npc_roles.json中的键匹配）
    set("ai_npc_id", "template_npc_id");
    set("ai_topics", ({"话题1", "话题2", "话题3"}));
    
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

// 对话命令
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

    // 发送AI请求到中心化守护程序
    AI_CLIENT_D->send_chat_request(
        query("ai_npc_id"),
        player_id,
        player_name,
        topic,
        context
    );

    return 1;
}

// 询问命令
mixed accept_ask(object me, string topic) {
    return accept_talk(me, topic);
}

// 主动打招呼
void greeting(object me) {
    accept_talk(me, "初次见面");
}

// 心跳函数，可用于定时互动
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