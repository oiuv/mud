#include <ansi.h>

inherit ROOM;

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
    int exp, pot, day, month, *date, exp0, exp1;
    string festival;
    date = localtime(time());
    month = date[4] + 1;
    day = date[3];
    exp = me->query("combat_exp");
    exp0 = me->query("experience");
    exp1 = me->query("learned_experience");
    festival = "festival/" + date[5] + "/" + month;

    if (me->is_busy())
    {
        return notify_fail("你现在正忙着呢，没法静下心来祈祷。\n");
    }

    message_vision(HIG "$N" HIG "跪在神像前，恭恭敬敬的磕了三个响头，然后默默的祈祷着。\n" NOR, me);
    // 修正玩家数据问题
    if ( exp0 < exp1 )
    {
        me->set("learned_experience", exp0);
    }

    if (me->query(festival) == day)
    {
        tell_object(me, HIR "但是你今天已经被祝福过了（请明天再来吧）。\n" NOR);
    }
    else
    {
        if (exp < 10000)
            pot = 10000;
        else if (exp > 100000)
            pot = 100000;
        else
            pot = exp;
        pot = me->improve_potential(pot);
        if (! me->query("skybook/guard/death"))
            me->set("skybook/guard/death", 1);
        me->set(festival, day);
        message_vision(HIW "$N获得了" + chinese_number(pot) + "点潜能奖励。\n" NOR, me);
        me->start_busy(3);
    }

    return 1;
}
