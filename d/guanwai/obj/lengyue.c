// lengyue.c 冷月宝刀
#include <weapon.h>

inherit BLADE;

#include <ansi.h>

void create()
{
	set_name(HIG "冷月宝刀" NOR, ({ "moon blade", "blade" }));
	set_weight(7000);
	if (clonep())
		set_default_object(__FILE__);
	else {
        	set("unit", "柄");
        	set("value", 1000000);
                set("no_sell", "这...这玩艺怪吓人的...\n");
        	set("material", "steel");
        	set("long", "这是胡家祖传的宝刀，冷气森森，锐利无比。\n" );
        	set("wield_msg", HIG "$N" HIG "抓起刀柄，众人只觉眼前青光一"
			         "闪，寒气逼人，$N" HIG "手中已经多了一柄$n"
			         HIG "，刀光如水，流转不定。\n" NOR);
        	set("unwield_msg", HIW "$N" HIW "弹刀清啸，心中感慨，将$n"
				   HIW "插回刀鞘。\n");
	}
	init_blade(180);
	setup();
}

