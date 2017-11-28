#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", NOR + RED "大枣树上" NOR);
        set("long", @LONG
这里是石窟内的一棵百仗高的大枣树上，但见此处被树叶
所盖，密不透风。
LONG);
        set("exits", ([
              "up"    :  __DIR__"ontree2",
              "down"  :  __DIR__"undertan",
        ]));

        set("no_clean_up", 0);

        setup();

}

void init()
{       
        add_action("do_jump", ({ "jump", "tiao" }));
}

int do_jump(string arg)
{
        object me = this_player();
        object ob;

        if (! arg || arg != "down" )
                return notify_fail("你要往哪儿跳？\n");

        if (! ob = find_object(__DIR__"undertan"))
                ob = load_object(__DIR__"undertan");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");

        tell_room(ob, HIC + me->name() + "从大枣树上跳了下来。\n" NOR, me);

        me->move(ob);

        return 1;

}

int valid_leave(object me, string dir)
{
        if (dir == "down")
        { 
               write(HIC "这里离地面太高，看来你只有跳下去了。\n" NOR);
               return -1;
        }

        return 1;
} 


