// jiyu.c 鲫鱼

inherit ITEM;

#include <ansi.h>
#include "fish.h";

void create()
{
        set_name("鲫鱼", ({ "ji yu", "jiyu" }) );
        if (clonep())
                set_default_object(__FILE__);
        else
        {
	        set("long", "一条活蹦乱跳的大鲫鱼。\n");
                set("unit", "条");
        }

	setup();
}
