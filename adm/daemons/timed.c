#include <localtime.h>

inherit CORE_TIME_D;

private int real_anchor;
private int game_anchor;
private int calendar_era;

void clock();

// 宿主时间按真实经过秒数推进，不因心跳延迟或重新启动丢失经过时间。
int query_gametime() {
    if (!real_anchor) return ::query_gametime();
    return game_anchor + (time() - real_anchor) * DATE_SCALE;
}

mixed save_dbase_data() {
    if (!real_anchor) return ::save_dbase_data();
    return ([ "gametime": query_gametime(), "clock_version": 1,
        "real_anchor": real_anchor, "game_anchor": game_anchor, "calendar_era": calendar_era ]);
}

int receive_dbase_data(mixed data) {
    if (mapp(data) && data["clock_version"] == 1 &&
        intp(data["real_anchor"]) && data["real_anchor"] > 0 &&
        intp(data["game_anchor"]) && data["game_anchor"] >= 0 &&
        intp(data["calendar_era"]) && data["calendar_era"] > 0) {
        real_anchor = data["real_anchor"];
        game_anchor = data["game_anchor"];
        calendar_era = data["calendar_era"];
    }
    return ::receive_dbase_data(data);
}

// 旧记录首次建立锚点时沿用原起始日期；以后只恢复，不再按现实日取模。
void init_time() {
    int *lt;
    int first_start;

    first_start = !real_anchor;
    if (first_start) {
        real_anchor = time();
        game_anchor = (GAME_TIME(real_anchor) % 86400) * DATE_SCALE;
        lt = analyse_time(game_anchor);
        // CORE_TIME_D 正纪年公式为内部年份 - 1970 + era。
        calendar_era = GAME_TIME(real_anchor) / 86400 - lt[LT_YEAR] + 1970;
    }
    set_scale(1, calendar_era, DATE_SCALE);
    reset_gametime(query_gametime());
    process_gametime(query_gametime());
    // 锚点仅需首次建立时强制落盘，正常运行沿用公共数据库保存周期。
    if (first_start) DBASE_D->save();
}

void heart_beat() {
    process_realtime();
    process_gametime(query_gametime());
}

void create() {
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
void process_per_second() {
    // debug_message("---时间精灵---");
    // debug_message(ctime());
    // debug_message(TIME_D->real_time_description("公元"));
    // debug_message(TIME_D->game_time_description("炎黄"));
}

// 时钟
void clock() {
    // CHANNEL_D->do_channel(this_object(), "chat", sprintf("现在时间 %s", real_time_description()));
    message("success", "【时间精灵】" + sprintf("现在时间 %s\n", real_time_description()), users(), 0);
}
