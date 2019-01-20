// Room: /d/mingjiao/shandong.c
// Date: Java 97/04/9

#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "明教密洞");
	set("long", @LONG
这里是一个小小土洞，周围黑乎乎的很难看清楚。隐隐约约，可
以看到一扇大石门(men)。
LONG );
	set("exits", ([
		"out"  : __DIR__"huangtulu2",
	]));
	set("item_desc", ([
		"men"  : "一扇大石门，看来总有两万斤重吧。\n",
	]));
	set("outdoors", "mingjiao");
	setup();
}

void init()
{
        add_action("do_break", "break");
}

int do_break(string arg)
{
        object /**ob,*/ me = this_player();
//      int i;

        if (arg != "men")
		return notify_fail("你在干吗? \n");

	if (me->query("neili") < 2000)
	{
		write("你运了运气，觉得自己现在的内力不济。\n");
		return 1;
	}

	me->add("neili", -2000);
        if (me->query_skill("force", 1) < 300)
        {
                message_vision(CYN "$N" CYN "呀呀嘿嘿废了半天力气，结果"
		   	       "没什么动静。\n", me);
		tell_object(me, "看来是自己的内功火候还不够。\n");
                return 1;
        }

        message_vision(CYN "石门在$N" CYN "一击之下轧轧声响，缓缓移开。\n" NOR,
		       me);

        set("exits/enter",__DIR__"midao0");
        me->add("neili", -400);
        remove_call_out("close");
        call_out("close", 5, this_object());
        return 1;
}

void close(object room)
{
        message("vision", "石门又在轧轧声响，缓缓闭上。\n"NOR, room);
        room->delete("exits/enter");
}
