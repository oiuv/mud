#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_QIN;

void create()
{
        set_name(NOR + YEL "胡琴" NOR, ({ "hu qin", "hu", "qin" }));
        set_weight(600);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "把");
                set("long", NOR + YEL "这是一把普通的胡琴。\n" NOR);
		set("value", 50);
		set("material", "wood");
	}
	setup();
}

void init()
{
        add_action("play_qin", "play");
}
