// xianhai.c 陷害卡

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIR "陷害卡" NOR, ({ "card", "throw card"}) );
	set_weight(100);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", "一张诡秘的卡片，据说用它可以陷害别人。\n");
                set("value", 1);
                set("no_sell", 1);
		set("unit", "张");
                set("time_to_leave", 20);
	}
}
