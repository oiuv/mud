#include <ansi.h> 
inherit ROOM;

void create()
{
        set("short", "柏树林");
        set("long", @LONG
这里是树林的边缘，光线亮的多了。参天的柏树也稀疏了
很多。旁边有一丛灌木(frutex)杂生。灌木再往前就是悬崖了。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "west" : __DIR__"baishulin3",
                "southdown" : __DIR__"baishulin2",
        ]));
        set("no_clean_up", 0);
        set("count",1);
        set("item_desc", ([
                "frutex": GRN "一丛你叫不出名字的灌木，其中夹杂着很多小刺。\n" NOR,
        ]));

        setup();
}

void init()
{
        add_action("do_kan","kan");
}

int do_kan(string arg)
{
        object me = this_player();
        object weapon, ob;

        if (! arg || arg != "frutex" )
                return notify_fail("你要砍什么？\n");

        if (! objectp(weapon = me->query_temp("weapon")))
                return notify_fail("不用家伙恐怕不行吧！\n");

        if (query("count") > 0)
        {
                message_sort(HIC "\n$N" HIC "拔出兵刃，走到灌木丛跟前一阵乱"
                             "砍，把面前一些耸立的灌木砍倒以后，$N" HIC "发"
                             "觉下面生长着一棵什么小草，于是顺手拔了起来，没"
                             "想到下面连着好大一块根茎，竟然是一块成型的茯苓"
                             "。\n" NOR, me);
                add("count", -1);
                ob = new(__DIR__"obj/fuling");
                ob->move(me, 1);
        } else
        {
                message_sort(HIC "\n$N" HIC "拔出兵刃，走到灌木丛跟前一阵乱"
                             "砍，把面前一些耸立的灌木砍倒，可下面却什么都没"
                             "有，将$N" HIC "累得够呛。\n", me);
        }

        return 1;
}
