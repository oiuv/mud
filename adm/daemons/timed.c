inherit CORE_TIME_D;

void clock();

// 初始化游戏时间，同步现实世界时间
void init_time()
{
    // 设置游戏世界时间戳
    reset_gametime((GAME_TIME(time()) % 86400) * DATE_SCALE);
    // 设置游戏tick、scale、year(游戏年)，说明：现实tick秒是游戏scale秒
    set_scale(1, -GAME_TIME(time()) / 86400, DATE_SCALE);
}

void create()
{
    ::create();
    init_time();
    // 设置真实时间计划任务
    set_real_crontab(
        ({
            "0 * * * * *", (: clock() :), "整点报时",
        })
    );
    // 设置游戏时间计划任务
    set_game_crontab(
        ({
            // "5,25,45 * * * * *", ( : TIME_D->save() :), "存储游戏世界时间",
            // "*/2 * * * * *", (: debug_message("炎黄群侠传当前游戏时间：" + NATURE_D->game_time()) :), "游戏时间测试任务",
            // "* * * * * *", (: debug(query_gametime()) :), "游戏时间测试任务",
            // "5-15/3 * * * * *", (: debug_message("game_crontab! 5-15 " + ctime()) :), "测试任务",
        }));
    // set_heart_beat(1);
}

// 每秒执行一次
void process_per_second()
{
    // debug_message("---时间精灵---");
    // debug_message(ctime());
    // debug_message(TIME_D->real_time_description("公元"));
    // debug_message(TIME_D->game_time_description("炎黄"));
}

// 时钟
void clock()
{
    // CHANNEL_D->do_channel(this_object(), "chat", sprintf("现在时间 %s", real_time_description()));
    message("success", "【时间精灵】" + sprintf("现在时间 %s\n", real_time_description()), users(), 0);
}
