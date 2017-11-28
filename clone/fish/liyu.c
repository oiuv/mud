// liyu.c 鲤鱼

inherit ITEM;

#include <ansi.h>
#include "fish.h"

void create()
{
        set_name("鲤鱼", ({ "liyu", "li yu" }) );
        if (clonep())
                set_default_object(__FILE__);
        else
        {
	        set("long", "一条活蹦乱跳的大鲤鱼。\n");
                set("unit", "条");
        }

	setup();
}
