// natured.c

#include <ansi.h>
#include <localtime.h>

#define REMEMBER_CHAR '#'

#ifndef NATURE_DIR
#define NATURE_DIR CORE_DIR "/system/etc/nature/"
#endif

nosave int current_day_phase = -1;
nosave mapping *day_phase;
nosave int light = 0;

private mapping *read_table(string file);

void select_day_phase();

mixed *query_localtime()
{
    return TIME_D->query_game_time();
}

int query_minute() { return query_localtime()[LT_MIN]; }
int query_hour() { return query_localtime()[LT_HOUR]; }
int query_day() { return query_localtime()[LT_MDAY]; }
int query_month() { return query_localtime()[LT_MON]; }
int query_year() { return query_localtime()[LT_YEAR]; }

void create()
{
    day_phase = read_table(NATURE_DIR "day_phase");
    // 仅继承对象呼叫，避免重复
    if (inherits(CORE_NATURE_D, this_object()))
    {
        select_day_phase();
    }
}

void update_day_phase()
{
    string msg;

    msg = ansi(day_phase[current_day_phase]["outcolor"] + day_phase[current_day_phase]["time_msg"] + NOR);
    message("outdoor", msg, users());
    if (!undefinedp(day_phase[current_day_phase]["event_fun"]))
        event(this_object(), day_phase[current_day_phase]["event_fun"]);
}

void select_day_phase()
{
    int i, t, n, *ts;

    remove_call_out("select_day_phase");

    // Get hour of today.
    t = query_hour();
    ts = TIME_D->query_scale();

    // Find the day phase for now.
    for (i = 0; i < sizeof(day_phase) - 1; i++)
        if (t < day_phase[i + 1]["hour"])
            break;

    if (i == sizeof(day_phase) - 1)
    {
        // the last hour
        n = 24 - t;
    }
    else
        n = day_phase[i + 1]["hour"] - t;

    // calculate the call out time
    n = n * 60 - query_minute();
    n = n * 60 * ts[0] / ts[1];
    if (n < 1)
        n = 1;
    call_out("select_day_phase", n);

    if (i != current_day_phase)
    {
        current_day_phase = i;
        update_day_phase();
    }
}

// This event is called everyday by update_day_phase, defined in the
// "event_fun" field in /adm/etc/nature/day_phase

void event_midnight(object file)
{
    string msg;
    int m, d;

    m = query_month() + 1;
    d = query_day();

    msg = 0;
    switch (m * 100 + d)
    {
    case 321:
        msg = HIG "春天终于到了，经过了漫长的冬季，万物开始复苏。" NOR;
        break;
    case 622:
        msg = HIR "夏天来临了，天气越来越热，所有的生物都异常活跃。" NOR;
        break;
    case 923:
        msg = HIY "已然是秋天了，大地一片金黄，正是收获的时期。" NOR;
        break;
    case 1222:
        msg = HIW "来自北方的寒流扫过大地，万物又开始了寂静的休眠。" NOR;
        break;
    }

    if (msg)
        message("vision", HIC "【季节天时】" + msg, users());

    switch (m)
    {
    //spring weather
    case 3:
    case 4:
    case 5:
        switch (random(3))
        {
        case 0:
            day_phase = read_table(NATURE_DIR "spring_rain");
            break;
        case 1:
            day_phase = read_table(NATURE_DIR "spring_sun");
            break;
        case 2:
            day_phase = read_table(NATURE_DIR "spring_wind");
            break;
        }
        break;
    //summer weather
    case 6:
    case 7:
    case 8:
        switch (random(3))
        {
        case 0:
            day_phase = read_table(NATURE_DIR "summer_rain");
            break;
        case 1:
            day_phase = read_table(NATURE_DIR "summer_sun");
            break;
        case 2:
            day_phase = read_table(NATURE_DIR "summer_wind");
            break;
        }
        break;
    //autumn weather
    case 9:
    case 10:
    case 11:
        switch (random(3))
        {
        case 0:
            day_phase = read_table(NATURE_DIR "autumn_rain");
            break;
        case 1:
            day_phase = read_table(NATURE_DIR "autumn_sun");
            break;
        case 2:
            day_phase = read_table(NATURE_DIR "autumn_wind");
            break;
        }
        break;
    //winter weather
    case 12:
    case 1:
    case 2:
        switch (random(3))
        {
        case 0:
            day_phase = read_table(NATURE_DIR "winter_rain");
            break;
        case 1:
            day_phase = read_table(NATURE_DIR "winter_sun");
            break;
        case 2:
            day_phase = read_table(NATURE_DIR "winter_wind");
            break;
        }
        break;
    default:
        day_phase = read_table(NATURE_DIR "day_phase");
    }
}

void event_dawn(object file)
{
    light = 3;
    // debug_message("3 event_dawn : " + file);
}

void event_sunrise(object file)
{
    light = 6;
    // debug_message("6 event_sunrise : " + file);
}

void event_morning(object file)
{
    light = 9;
    // debug_message("9 event_morning : " + file);
}

void event_noon(object file)
{
    light = 12;
    // debug_message("12 event_noon : " + file);
}

void event_afternoon(object file)
{
    light = 9;
    // debug_message("15 event_afternoon : " + file);
}

void event_evening(object file)
{
    light = 6;
    // debug_message("18 event_evening : " + file);
}

void event_night(object file)
{
    light = 3;
    // debug_message("21 event_night : " + file);
}

// 环境ob光线，可重写此方法
int light(object ob)
{
    return light;
}

// 窗外景象，室内调用
string outdoor_room_description()
{
    return ansi(day_phase[current_day_phase]["outcolor"] + "    " +
                day_phase[current_day_phase]["desc_msg"] + "。");
}

private mapping *read_table(string file)
{
    string *line, *field, *format;
    mapping *data;
    int i, rn, fn;

    line = explode(read_file(file), "\n");
    data = ({});
    for (i = 0; i < sizeof(line); i++)
    {
        if (line[i] == "" || line[i][0] == REMEMBER_CHAR)
            continue;
        if (!pointerp(field))
        {
            field = explode(line[i], ":");
            continue;
        }
        if (!pointerp(format))
        {
            format = explode(line[i], ":");
            continue;
        }
        break;
    }

    for (rn = 0, fn = 0; i < sizeof(line); i++)
    {
        if (line[i] == "" || line[i][0] == REMEMBER_CHAR)
            continue;
        if (!fn)
            data += ({allocate_mapping(sizeof(field))});
        sscanf(line[i], format[fn], data[rn][field[fn]]);
        fn = (++fn) % sizeof(field);
        if (!fn)
            ++rn;
    }
    return data;
}

mapping *query_day_phase() { return day_phase; }
