#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("香炉", ({ "xiang lu", "lu" }) );
	set_weight(3000);
	set_max_encumbrance(5000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "个");
                set("long", "这是一个庙里常见的香炉，用来让善男信女们插香(pushin)进愿。\n");
		set("value", 1000);
		set("material", "gold");
		set("no_get",1);
		set("no_drop",1);
		set("amount",30);
	}
	setup();
}

void init()
{
	add_action("do_pushin", "pushin");
}

int do_pushin(string arg)
{
	object me, ob;
	
	me = this_player();

	if(!arg&&arg!="xiang") return notify_fail("你要插什么东西？\n");

	if( me->query_temp("marks/dian_temp") &&  random(2) == 1 )
	{
		ob=new("/d/tianlongsi/obj/box");
		ob->move(me);
		tell_object(me, "\n你忽然觉得香在插下时被什么挡住了！\n你扒开香灰，发现了一个盒子。\n");
		return 1;
	}
	else
		return notify_fail("你把一柱香插进香炉，拜了两拜。\n");
	return 0;
}
