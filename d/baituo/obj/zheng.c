// zheng.c

#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_ZHENG;

void create()
{
        set_name(NOR + YEL "古筝" NOR, ({ "gu zheng", "gu", "zheng" }));
        set_weight(300);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "台");
                set("long", YEL "这是一台看上去有些陈旧的古筝。\n" NOR);
		set("value", 50);
		set("material", "wood");
	}
	setup();
}

void init()
{
        add_action("play_zheng", "play");
}
