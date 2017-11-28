#include <ansi.h>
inherit ROOM;

#define JIASHA    "/clone/lonely/book/kuihua3"

void create()
{ 
       set("short", "房梁");
       set("long", @LONG
你在柴房的房梁上四下观瞧，周围全都是些烂木头破砖瓦。
LONG );
        set("exits", ([
                "down" : __DIR__"mishi",
        ]));
        "/clone/lonely/book/kuihua3"->foo();
        setup();
}

void init()
{       
        object me = this_player(), ob;
        int exp, pot, sc;

        exp = 10000 + random(3000);
        pot = 3000 + random(300);
        sc = 10 + random(50);

        ob = find_object(JIASHA);
        if (! ob) ob = load_object(JIASHA);

        if (! objectp(ob))
                return 0;

        if (! objectp(present("jia sha", this_object())))
                return 0;

        if (! (int)me->query("skybook/xiaoao/baodian"))
        {
                me->add("combat_exp", exp);
                me->add("potential", pot);
                me->add("score", sc);
                tell_object(me, HIY "\n你刚跃上房梁，顿时发现一件袈裟摆放其中。\n\n"
                                NOR + HIW "你成功的找到了葵花宝典！\n" NOR + HIC
                                "通过这次的历练，你获得了" + chinese_number(exp) +
                                "点经验、" + chinese_number(pot) + "点潜\n能以及"
                                + chinese_number(sc) + "点江湖阅历。\n\n" NOR);
                me->set("skybook/xiaoao/baodian", 1);
        } else
                tell_object(me, HIY "\n你刚跃上房梁，顿时发现一件袈裟摆放其中。\n\n" NOR);
}

