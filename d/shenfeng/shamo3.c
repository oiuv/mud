#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "大漠风沙");
        set("long", @LONG
你处在酷热如烘炉的沙漠中，热的令人连气都透不出。除
了满耳呼呼的风声什么也听不见。除了满眼滚滚的飞沙什么也
看不见；天地间仿佛只剩下你一个人。你脚下缓缓而动的流沙
给你如履薄冰的感觉。
LONG);
        set("outdoors", "shenfeng");
        set("exits", ([
                "east" : __DIR__"shamo2",
                "west" : __DIR__"lvzhou",
	]));
        setup();        
}

void init()
{
        object me = this_player();

        if (userp(me))
                call_out("kill_user", 1, me);
}

int kill_user(object me)
{
        object ob;

        if (! me || environment(me) != this_object())
		return 1;

        if (! present("tu ying", this_object()))
        {
    		message("vision", HIR "\n突然间，只见一个黑影从天"
                                  "而降。\n" NOR, this_object());

                ob = new("clone/quarry/ying");
                ob->move(this_object());
                ob->kill_ob(me);
        }
}

int valid_leave(object me, string dir)
{
        int current_water;
        current_water = me->query("water");

        if (userp(me) && current_water == 0)
        {
                write(HIY "你已经感到快不行了，冥冥中觉得有人把你"
                      "抬到龙门客栈。\n" NOR);
                me->unconcious();
                me->move(__DIR__"longmen");
        } else

        if (current_water > 0 && current_water < 20)
        {
               write(HIR "你过度缺水，渴得眼冒金星。\n" NOR);
               me->set("water", 0);
        }

        if (current_water >= 20)
               me->add("water", -20);

        return 1;
}
