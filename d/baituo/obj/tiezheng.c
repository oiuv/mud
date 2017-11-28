// tiezheng.c

#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_ZHENG;

void create()
{
        set_name(NOR + WHT "铁筝" NOR, ({ "tie zheng", "tie", "zheng" }));
        set_weight(300);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "台");
                set("long", WHT "这是一台黑黝黝的铁筝。\n" NOR);
		set("value", 5000);
		set("material", "steel");
	}
	setup();
}

void init()
{
        add_action("play_zheng", "play");
}
