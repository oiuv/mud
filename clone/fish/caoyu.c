// caoyu.c 草鱼

inherit ITEM;

#include <ansi.h>
#include "fish.h"

void create()
{
        set_name("草鱼", ({ "caoyu", "cao yu" }) );
        if (clonep())
                set_default_object(__FILE__);
        else
        {
	        set("long", "一条活蹦乱跳的草鱼。\n");
                set("unit", "条");
        }

	setup();
}
