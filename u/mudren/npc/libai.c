// AI李白NPC
// 集成智能对话功能，使用中心化AI服务

inherit NPC;

void create() {
    ::create();

    set_name("李白", ({"li bai", "libai", "li", "poet"}));
    set("title", "诗仙");
    set("long",
        "李白，字太白，号青莲居士，唐代著名诗人，被后人誉为诗仙。
        他身着白衣，腰系酒葫芦，手持长剑，目光如电，神态潇洒不羁。
        你可以与他交谈，讨论诗词歌赋，美酒剑术。\n" +
        "指令：talk 李白 [内容] - 与李白对话\n" +
        "      ask 李白 about [话题] - 询问特定话题"
    );

    set("gender", "男性");
    set("age", 42);
    set("combat_exp", 100000);
    set("str", 25);
    set("int", 35);
    set("con", 22);
    set("dex", 28);

    setup();
    carry_object("/clone/weapon/changjian");
    carry_object("/clone/misc/hulu");
}

// 对话命令
int accept_talk(object me, string topic) {
    string npc_id = query("id");
    string player_id = me->query("id");
    string player_name = me->name();
    string context;

    if (!topic || topic == "") {
        topic = "你好";
    }

    // 构造简洁的上下文信息
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

// 询问命令
mixed accept_ask(object me, string topic) {
    return accept_talk(me, topic);
}

// 主动打招呼
void greeting(object me) {
    accept_talk(me, "你好");
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
