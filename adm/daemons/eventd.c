// eventd.c

#include <ansi.h>
#include <localtime.h>

inherit F_DBASE;

STATIC_VAR_TAG string *event_name;      // 系统中所有的事件
STATIC_VAR_TAG mapping event_list;      // 待触发的事件

void collect_all_event();

void create()
{
        string event;
        object eob;

        seteuid(ROOT_UID);
        set("channel_id", "事件精灵");
        CHANNEL_D->do_channel(this_object(), "sys", "事件系统已经启动。");

        event_name = get_dir(EVENT_DIR + "*.c");
        event_name = map_array(event_name, (: $1[0..<3] :));

        // 析构所有的事件
        foreach (event in event_name)
                if (objectp(eob = find_object(EVENT_DIR + event)))
                        destruct(eob);

        event_list = ([ ]);
        collect_all_event();
        set_heart_beat(5);      // 每个小时心跳一次
}

int clean_up()
{
        return 1;
}

string *query_all_event()
{
        return event_name;
}

mapping query_event_list()
{
        return event_list;
}

// EVENT_D启动时收集所有的事件
void collect_all_event()
{
        string event;

        foreach (event in event_name)
                (EVENT_DIR + event)->create_event();
}

// 登记在某时刻启动事件
int test(string st, int year, int month, int day, int hour, mixed para)
{
        if (undefinedp(event_list[st]))
                return notify_fail("not found..\n");

        event_list[st] = ({ year, month, day, hour, para });
}

// 登记在某时刻启动事件
int at_when(int year, int month, int day, int hour, mixed para)
{
        object pob;
//      int t;

        if (! objectp(pob = previous_object()))
                return 0;

        if (geteuid(pob) != ROOT_UID)
                // 为了安全，只有具有ROOT身份的对象才能够登记事件
                return 0;

        event_list[base_name(pob)] = ({ year, month, day, hour, para });
}

// 登记在一段时间以后启动事件
// 如果传入的参数是负数，则标志了一个绝对的时间
// 比如：Y = 0 month = 0 day = 1 hour = -5 表示明天5点钟 
int at_after(int year, int month, int day, int hour, mixed para)
{
        mixed *lt;

        lt = NATURE_D->query_localtime(time());
        if (year < 0)  year = -year;   else year += lt[LT_YEAR];
        if (month < 0) month = -month; else month += lt[LT_MON];
        if (day < 0)   day = -day;     else day += lt[LT_MDAY];
        if (hour < 0)  hour = -hour;   else hour += lt[LT_HOUR];
        return at_when(year, month, day, hour, para);
}

// 每个小时心跳一次，检查所有的事件
void heart_beat()
{
        mixed *lt;
        string *ks;
        string event;
        mixed *el;
        int tnow, tt;
        int r;

        lt = NATURE_D->query_localtime(time());
        tnow = lt[LT_YEAR] * 1000000 +
               lt[LT_MON]  * 10000 +
               lt[LT_MDAY] * 100 +
               lt[LT_HOUR];

        ks = keys(event_list);
        foreach (event in ks)
        {
                el = event_list[event];
                tt = el[0] * 1000000 +
                     el[1] * 10000 +
                     el[2] * 100 +
                     el[3];
                if (tnow < tt) continue;

                // 先去掉这个事件 - 这个操作必须在触发前完成
                map_delete(event_list, event);

                // 事件需要触发，调用传入参数
                r = catch(event->trigger_event(el[4],
                                               lt[LT_YEAR], lt[LT_MON],
                                               lt[LT_MON], lt[LT_MDAY]));
                if (r) log_file("static/event", sprintf("%s event:%s trigger occur an error.\n",
                                                        log_time(), ks));
        }
}