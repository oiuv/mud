#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "鄂鱼潭中");
        set("long", @LONG
鄂鱼潭中寒水刺骨，深不见底，潭底水声潺潺，令人毛骨
悚然。看来要离开这里只有游(swim)回岸边(bank)。
LONG);
        set("objects", ([
                "/clone/quarry/eyu" : 1 + random(6),
        ]));

        set("no_clean_up", 0);
        setup();
}

void init()
{       
        add_action("do_swim", ({ "swim", "you" }));
}

int do_swim(string arg)
{
        object me = this_player();
        object ob;

        if (! arg || arg != "bank" )
                return notify_fail("你要往哪儿游？\n");

        if (! ob = find_object(__DIR__"eyutan1"))
                ob = load_object(__DIR__"eyutan1");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");

        tell_object(me, HIY "你使尽所有力气向岸边游去…\n" NOR);
        tell_room(ob, HIC + me->name() + "游了上来。\n" NOR, me);
        me->move(ob);

        return 1;
}
