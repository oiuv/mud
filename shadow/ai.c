
inherit F_SHADOW;

// AI对话命令
int accept_talk(object me, string topic) {
    string npc_id = this_object()->query("ai_npc_id") || this_object()->query("id");
    string player_id = me->query("id");
    string player_name = me->name();
    string context;

    // 构造简洁的上下文信息
    context = sprintf(
        "时间：%s | 地点：%s | 天气：%s\n"
        "玩家性别：%s | 玩家年龄：%s | 玩家门派：%s | 玩家师父：%s\n",
        NATURE_D->game_time(),
        environment(query_shadow_now())->query("short") || "未知",
        trim(remove_ansi(NATURE_D->outdoor_room_description())),
        me->query("gender") || "未知",
        me->query("age") ? sprintf("%d岁", me->query("age")) : "未知",
        me->query("family/family_name") || "无门派",
        me->query("family/master_name") || "无师父"
    );

    if (!topic || topic == "") {
        topic = "你好";
    }

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
