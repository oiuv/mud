// zhuxiao.c

#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_XIAO;

void create()
{
        set_name("竹萧", ({ "zhuxiao" }));
        set_weight(300);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "根");
                set("long", "一根普普通通的竹萧，但是也能吹出动人的曲子。\n");
		set("value", 10);
		set("material", "bamboo");
	}
	setup();
}

void init()
{
        add_action("play_xiao", "play");
}
