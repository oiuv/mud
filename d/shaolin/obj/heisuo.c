// 黑索

#include <ansi.h>
#include <weapon.h>

inherit WHIP;

void create()
{
	set_name("黑索", ({ "black whip", "hei suo", "suo", "whip" }));
	set_weight(800);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "根");
		set("long", "这是一根漆黑的长鞭，毫不起眼，但是入手沉重，且\n"
                            "不失柔韧，实在是千锤百炼之物。\n");
                set("no_sell", "这是啥破玩艺，上吊用的？\n");
		set("value", 50000);
		set("material", "steel");
		set("wield_msg", BLK "$N" BLK "一伸手，悄无声息的将$n握在手中。\n" NOR);
		set("unwield_msg", WHT "$N" WHT "将手中的$n卷起收好。\n" NOR);
                set("stable", 70);
	}

	init_whip(120);
	setup();
}
