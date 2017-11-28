// rice.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(YEL "手谕" NOR, ({ "pass" }) );
        set_weight(10);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "张");
                set("no_sell", 1);
		set("material", "paper");
	}
        set("long", "一张手谕。\n");
	setup();
}

