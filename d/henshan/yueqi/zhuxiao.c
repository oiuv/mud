#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_XIAO;

void create()
{
        set_name(GRN "普通竹萧" NOR, ({ "zhu xiao", "zhu", "xiao" }));
        set_weight(600);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "把");
                set("long", GRN "一把翠竹所制的洞萧，非常普通。\n" NOR);
		set("value", 200);
		set("material", "bamboo");
	}
	setup();
}

void init()
{
        add_action("play_xiao", "play");
}
