// muqin.c

#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_QIN;

void create()
{
        set_name("木琴", ({ "muqin" }));
        set_weight(600);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "台");
                set("long", "一个平凡的木琴，没有什么特殊之处。\n");
		set("value", 50);
		set("material", "wood");
	}
	setup();
}

void init()
{
        add_action("play_qin", "play");
}
