#include <ansi.h>
#include <localtime.h>

inherit ROOM;

#define TIME "/cmds/usr/time"
#define GIFT "/clone/fam/max/naobaijin"
// 农历节日
nosave mapping *lunar_day = ({
    (["month" :  1, "day" :  1, "name" : RED"春节"NOR]),
    (["month" :  1, "day" : 15, "name" : RED"元宵节"NOR]),
    (["month" :  5, "day" :  5, "name" : GRN"端午节"NOR]),
    (["month" :  7, "day" :  7, "name" : CYN"七夕乞巧节"NOR]),
    (["month" :  8, "day" : 15, "name" : CYN"中秋节"NOR]),
    (["month" :  9, "day" :  9, "name" : MAG"重阳节"NOR]),
    (["month" : 12, "day" :  8, "name" : BLU"腊八节"NOR]),
    (["month" : 12, "day" : 23, "name" : RED"小年"NOR]),
    (["month" : 12, "day" : 30, "name" : RED"除夕"NOR]),
});
// 公历节日
nosave mapping *solar_day = ({
    (["month" :  1, "day" :  1, "name" : RED"元旦"NOR]),
    (["month" :  4, "day" :  5, "name" : CYN"清明节"NOR]),
    (["month" :  5, "day" :  1, "name" : WHT"国际劳动节"NOR]),
    (["month" : 10, "day" :  1, "name" : RED"中国国庆节"NOR]),
});

void create()
{
    set("short", "武庙二楼");
    set("long", @LONG
这里是岳王庙的二楼，这里供的是岳飞的长子岳云和义子
张宪，两尊塑像金盔银铠，英气勃勃。听说在炎黄子孙的传统
节假日来这里祈祷(pray)会得到祝福。
LONG);
    set("no_fight", 1);
    set("no_steal", 1);
    set("no_beg", 1);
    set("no_sleep_room", 1);

    set("exits", ([
        "down" : __DIR__"wumiao",
    ]));

    set("objects", ([
        "/adm/daemons/task/npc/zixu" : 1,
    ]));
    setup();
}

void init()
{
    add_action("do_pray", "pray");
}

int do_pray(string arg)
{
    object me = this_player();
    int exp, pot, wday, day, month, year, *date;
    // int exp0, exp1;
    string festival;

    date = localtime(time());
    year = date[LT_YEAR];
    month = date[LT_MON] + 1;
    day = date[LT_MDAY];
    wday = date[LT_WDAY];

    exp = me->query("combat_exp");
    // exp0 = me->query("experience");
    // exp1 = me->query("learned_experience");

    festival = "festival/" + year + "/" + month;

    if (me->is_busy())
    {
        return notify_fail("你现在正忙着呢，没法静下心来祈祷。\n");
    }

    message_vision(HIG "$N" HIG "跪在神像前，恭恭敬敬的磕了三个响头，然后默默的祈祷着。\n" NOR, me);

    if (me->query(festival) == day)
    {
        return notify_fail(HIR "但是你今天已经被祝福过了（请明天再来吧）。\n" NOR);
    }
    else
    {
        int i = 1;
        int lunar_m, lunar_d;
        // 取得农历日期
        sscanf(TIME->to_lunar(year + " " + month + " " + day), "%*d-%d-%d", lunar_m, lunar_d);
        // 绑定手机奖励加倍
        if (me->query("mobile"))
        {
            i *= 2;
        }
        else
        {
            tell_object(me, HIM "你还没绑定手机号码，输入`mobile`根据提示绑定手机可获得双倍奖励。\n" NOR);
        }
        // 周末加倍(无调休)
        if (!wday || wday == 6)
        {
            tell_object(me, HIM "今天是周末，奖励加倍^_^\n" NOR);
            i *= 2;
        }
        //节假日加倍
        foreach (mapping m in solar_day)
        {
            if (m["month"] < month)
            {
                continue;
            }
            if (m["month"] > month)
            {
                break;
            }
            if (month == m["month"] && day == m["day"])
            {
                tell_object(me, "今天是" + m["name"] + "，奖励加倍^_^\n");
                i *= 2;
                break;
            }
        }
        foreach (mapping m in lunar_day)
        {
            if (m["month"] < lunar_m)
            {
                continue;
            }
            if (m["month"] > lunar_m)
            {
                break;
            }
            if (lunar_m == m["month"] && lunar_d == m["day"])
            {
                tell_object(me, "今天是" + m["name"] + "，奖励加倍^_^\n");
                i *= 2;

                if (exp >= 100000)
                {
                    object gift = new (GIFT);
                    gift->move(me);
                    tell_object(me, "你得到节日礼物" + gift->short() + "^_^\n");
                }

                break;
            }
        }
        // 增加积分
        me->add("state/jifen", i);
        // 记录祈福次数
        me->add("state/pray", 1);

        // 潜能下限5K
        pot = exp / 100;
        if (pot < 5000)
            pot = 5000;

        // 周末双倍，上限5万
        pot *= i;
        if (pot > 50000)
            pot = 50000;

        pot = me->improve_potential(pot);
        if (me->query("skybook/guard/death") < i)
            me->set("skybook/guard/death", i);
        me->set(festival, day);
        message_vision(HIW "$N获得了" + chinese_number(pot) + "点潜能奖励和" + chinese_number(i) + "点积分。\n" NOR, me);
        me->start_busy(3);
    }

    return 1;
}
