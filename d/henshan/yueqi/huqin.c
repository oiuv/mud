#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_QIN;

void create()
{
        set_name(YEL "普通胡琴" NOR, ({ "hu qin", "hu", "qin" }));
        set_weight(600);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "把");
                set("long", YEL "一把普通的胡琴。\n" NOR);
		set("value", 200);
		set("material", "wood");
	}
	setup();
}

void init()
{
        add_action("play_qin", "play");
}
