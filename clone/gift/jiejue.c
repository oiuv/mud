// jiejue.c 解救卡

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIG "解救卡" NOR, ({ "card", "help card"}) );
	set_weight(100);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", "一张晶莹剔透的卡片，据说用它可以解决身陷地狱中的人。\n");
                set("value", 1);
                set("no_sell", 1);
		set("unit", "张");
	}
}
