#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "厨房");
	set("long", @LONG
这里是归云庄厨房，一个乡下妇人正在灶边忙来忙去，看
来她就是这里的厨娘了。你可以找厨娘要(serve)些吃的。
LONG);
	set("resource/water", 1);
	set("exits", ([
		"south" : __DIR__"huayuan",
	]));
	set("ricewater", 5);
	setup();
}

void init()
{
        add_action("do_serve", "serve");
}

int do_serve()
{
	object me, food, water;
	me = this_player();

	if (me->query("family/family_name") != "桃花岛")
		return notify_fail(CYN "厨娘道：你不是桃花岛弟子，不"
                                   "能拿取食物。\n" NOR);

        if (present("zongzi", me) || present("tea", me))
		return notify_fail(CYN "厨娘道：吃完了再拿，别浪费食"
                                   "物。\n" NOR);

	if (query("ricewater") > 0)
	{
		message_vision(CYN "厨娘连声答应，递给$N" CYN "一杯香"
                               "茶和一个粽子。\n" NOR, me);

		food = new(__DIR__"obj/zongzi");
		water = new("/d/wudang/obj/xiangcha");
		food->move(me);
		water->move(me);
		add("ricewater", -1);
	}
	else
		message_vision(CYN "厨娘对$N" CYN "歉声道：嗨，吃的喝"
                               "的都没了。\n" NOR, me);
	return 1;
}
