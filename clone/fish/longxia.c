// longxia.c 龙虾

inherit ITEM;

#include <ansi.h>
#include "xia.h";

void create()
{
        set_name("龙虾", ({ "long xia", "longxia" }) );
        if (clonep())
                set_default_object(__FILE__);
        else
        {
	        set("long", "一只威武的大龙虾。\n");
                set("unit", "只");
        }

	setup();
}
