// qingyu.c 青鱼

inherit ITEM;

#include <ansi.h>
#include "fish.h"

void create()
{
        set_name("青鱼", ({ "qingyu", "qing yu" }) );
        if (clonep())
                set_default_object(__FILE__);
        else
        {
	        set("long", "一条不安分的青鱼。\n");
                set("unit", "条");
        }

	setup();
}
