#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("锦盒", ({ "jin he", "he" }) );
	set_weight(3000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "个");
                set("long", "这是装舍利子的盒子,你似乎应该交还失主。\n");
		set("value", 1000);
		set("material", "wood");
	}
	setup();
}

void init()
{
	add_action("do_open", "open");
}

int do_open(string arg)
{
	object me, ob;
	
	me = this_player();

	if(!arg&&arg!="he") return notify_fail("你要打开什么东西？\n");
	message_vision("$N打开盒子，只见两支毒箭飞射而出，擦身而过！\n",me);
	message_vision("一个黑影突然出现，从$N手中一把抢过锦盒，飞身而去！\n",me);
	destruct(this_object());
	return 1;
}
