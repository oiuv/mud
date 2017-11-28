#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", NOR + RED "大枣树上" NOR);
        set("long", @LONG
这里是枣树顶，四下望去，突然感觉一阵眩晕，原来这里
离地面已有百来仗高了。抬头一看，猛然间你眼光一闪，发现
上面竟有一根树藤(teng)垂下。
LONG);
        set("item_desc", ([
              "teng" : HIG "\n看来可以借这根树藤爬(climb)出石窟。\n" NOR,
        ]));
        set("exits", ([
              "down"  :  __DIR__"ontree2",
        ]));

        set("no_clean_up", 0);

        setup();

}

void init()
{       
        add_action("do_climb", ({ "climb", "pa" }));
}

int do_climb(string arg)
{
        object me = this_player();
        object ob;

        if (! arg || arg != "teng" )
                return notify_fail("你要往哪儿爬？\n");

        if (! ob = find_object(__DIR__"ligui"))
                ob = load_object(__DIR__"ligui");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");

        message_vision(HIY "$N顺着树藤向上爬去…\n" NOR, me);

        me->move(ob);

        return 1;

}

int valid_leave(object me, string dir)
{
        if (dir != "down")
                 write(HIC "这里离地面太高，看来你只有跳下去了。\n" NOR);

        return 1;
}


