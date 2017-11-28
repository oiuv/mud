#include <ansi.h>
#include <music.h>

inherit ITEM;
inherit MI_XIAO;

void create()
{
        set_name(HIG "碧玉洞萧·幽兰" NOR, ({ "youlan xiao", "youlan", "xiao" }));
        set_weight(600);

	if (clonep())
		set_default_object(__FILE__);
	else {
                set("unit", "把");
                set("long", HIG "一把碧玉所制的洞萧，隐隐泛出绿"
				"光。上刻「" HIM "幽兰" HIG "」。\n" NOR);
		set("value", 5000000);
		set("material", "stone");
	}
	setup();
}

void init()
{
        add_action("play_xiao", "play");
}
