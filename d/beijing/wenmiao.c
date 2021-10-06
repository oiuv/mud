#include <ansi.h>

inherit ROOM;

void create()
{
    set("short", "文庙");
    set("long", @LONG
这里是文庙正殿，内有孔夫子像。历代皇帝都懂得利用儒教思想来巩固
自己的江山社稷，当朝皇帝自然也不例外。不论何人到此，都毕恭毕敬地上
香礼拜(pray)。
LONG );
    set("exits", ([
        "south" : __DIR__"dong_3",
    ]));

    set("objects", ([
        __DIR__"npc/shusheng1" : 2,
        __DIR__"npc/shusheng2" : 1,
        "/clone/npc/walker" : 1,
    ]));

    setup();
    //replace_program(ROOM);
}

void init()
{
    add_action("do_pray", "pray");
}

int do_pray(string arg)
{
    object me = this_player();
    int exp, pot, age, month, birthday, *born;

    age = me->query("age");
    month = me->age_month();

    // 不在用到 birthday 了
    born = localtime((((int)me->query("birthday")- 971000000) % 86400) * 365);
    birthday = born[4] + 1;

    exp = me->query("combat_exp");

    if (me->is_busy())
    {
        return notify_fail("你现在正忙着呢，没法静下心来祈祷。\n");
    }

    message_vision(HIG "\n$N" HIG "跪在神像前，恭恭敬敬的磕了三个响头，然后默默的祈祷着。\n" NOR, me);

    if (age > 15 && month == 1)
    {
        if (me->query("birthgift/" + age))
        {
            tell_object(me,
HIW
"     ┍----------------------------------------┑\n"+
"     ┃  ┌----------------------------------┐  ┃\n"+
"     ┃  │             "YEL"生日快乐"HIW"             │  ┃\n"+
"     ┃  │                                  │  ┃\n"+
"     ┃  │             *  *"HIR"r"HIW"*  *            │  ┃\n"+
"     ┃  │          * *"HIR"a"HIW"* "HIG"^"HIY"Y"HIG"^"HIW" *"HIR"i"HIW"* *         │  ┃\n"+
"     ┃  │         *"HIM"m"HIW"*"HIG"^"HIY"Y"HIG"^"HIW"*"HIG"^\\^"HIW"*"HIG"^"HIY"Y"HIG"^"HIW"*"RED"s"HIW"*        │  ┃\n"+
"     ┃  │         "HIG"^"HIY"Y"HIG"^"HIW"*"HIG"\\"HIW"*"RED"e"HIW"*"HIG"/"HIW"*"HIG"l"HIW"*"HIG"/"HIW"*"HIG"^"HIY"Y"HIG"^"HIW"        │  ┃\n"+
"     ┃  │         *"HIG"\\"HIW"*"CYN"t"HIW"*"HIG"|"HIY"Y"HIG"^\\^"HIY"Y"HIG"|"HIW"*"HIG"l"HIW"*"HIG"/"HIW"*        │  ┃\n"+
"     ┃  │        *"MAG"s"HIW"*"HIG"|"HIY"Y"HIG"^\\\\^/^//^"HIY"Y"HIG"|"HIW"*"HIR"a"HIW"*       │  ┃\n"+
"     ┃  │        "GRN"^"YEL"Y"GRN"^\\\\_^\\\\\\//^_//^"YEL"Y"GRN"^"HIW"       │  ┃\n"+
"     ┃  │        "GRN"^\\_^\\_\\_\\//_/_/^_/^"HIW"       │  ┃\n"+
"     ┃  │         "GRN"^^\\_^\\_\\\\/_/^_/^^"HIW"        │  ┃\n"+
"     ┃  │           "GRN"^^\\_ \\// _/^^"HIW"          │  ┃\n"+
"     ┃  │               "GRN"\\_\\_/"HIW"              │  ┃\n"+
"     ┃  │                "GRN"/|\\"HIW"               │  ┃\n"+
"     ┃  │               "GRN"/\\\\/\\"HIW"              │  ┃\n"+
"     ┃  │                                  │  ┃\n"+
"     ┃  │                  "RED"炎黄群侠传恭贺"HIW"  │  ┃\n"+
HIW"     ┃  └----------------------------------┘  ┃\n"+
"     ┗----------------------------------------┛\n" NOR);
            tell_object(me, HIC "               你获得过" + chinese_number(sizeof(keys(me->query("birthgift")))) + "次生日祝福\n\n" NOR);
            me->start_busy(3);
            return 1;
        }

        if (exp >= 50000000)
            pot = age * 3000;
        else if (exp >= 10000000)
            pot = age * 2000;
        else if (exp >= 1000000)
            pot = age * 1500;
        else
            pot = age * 1000;
        if (pot > 123450) pot = 123450;
        me->add("potential", pot);
        me->add("skybook/guard/death", 1);
        me->set("birthgift/" + age , 1);
        tell_object(me, HIR "生日快乐，你获得了" + chinese_number(pot) + "点潜能祝福。\n" NOR);
        tell_object(me,
HIW
"     ┍----------------------------------------┑\n"+
"     ┃  ┌----------------------------------┐  ┃\n"+
"     ┃  │             "YEL"生日快乐"HIW"             │  ┃\n"+
"     ┃  │                                  │  ┃\n"+
"     ┃  │             *  *"HIR"r"HIW"*  *            │  ┃\n"+
"     ┃  │          * *"HIR"a"HIW"* "HIG"^"HIY"Y"HIG"^"HIW" *"HIR"i"HIW"* *         │  ┃\n"+
"     ┃  │         *"HIM"m"HIW"*"HIG"^"HIY"Y"HIG"^"HIW"*"HIG"^\\^"HIW"*"HIG"^"HIY"Y"HIG"^"HIW"*"RED"s"HIW"*        │  ┃\n"+
"     ┃  │         "HIG"^"HIY"Y"HIG"^"HIW"*"HIG"\\"HIW"*"RED"e"HIW"*"HIG"/"HIW"*"HIG"l"HIW"*"HIG"/"HIW"*"HIG"^"HIY"Y"HIG"^"HIW"        │  ┃\n"+
"     ┃  │         *"HIG"\\"HIW"*"CYN"t"HIW"*"HIG"|"HIY"Y"HIG"^\\^"HIY"Y"HIG"|"HIW"*"HIG"l"HIW"*"HIG"/"HIW"*        │  ┃\n"+
"     ┃  │        *"MAG"s"HIW"*"HIG"|"HIY"Y"HIG"^\\\\^/^//^"HIY"Y"HIG"|"HIW"*"HIR"a"HIW"*       │  ┃\n"+
"     ┃  │        "GRN"^"YEL"Y"GRN"^\\\\_^\\\\\\//^_//^"YEL"Y"GRN"^"HIW"       │  ┃\n"+
"     ┃  │        "GRN"^\\_^\\_\\_\\//_/_/^_/^"HIW"       │  ┃\n"+
"     ┃  │         "GRN"^^\\_^\\_\\\\/_/^_/^^"HIW"        │  ┃\n"+
"     ┃  │           "GRN"^^\\_ \\// _/^^"HIW"          │  ┃\n"+
"     ┃  │               "GRN"\\_\\_/"HIW"              │  ┃\n"+
"     ┃  │                "GRN"/|\\"HIW"               │  ┃\n"+
"     ┃  │               "GRN"/\\\\/\\"HIW"              │  ┃\n"+
"     ┃  │                                  │  ┃\n"+
"     ┃  │                  "RED"炎黄群侠传恭贺"HIW"  │  ┃\n"+
HIW"     ┃  └----------------------------------┘  ┃\n"+
"     ┗----------------------------------------┛\n\n"
NOR);
        me->start_busy(3);
        return 1;
    }
    tell_object(me, HIB "你感觉自己的祈祷没有任何效果。\n" NOR);
    me->start_busy(1 + random(5));
    return 1;
}
