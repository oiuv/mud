// fumo-zhang.c 伏魔杖

#include <weapon.h>
#include <ansi.h>

inherit STAFF;
inherit F_NOCLONE;

void create()
{
	set_name("伏魔杖", ({ "fumo zhang", "zhang" }));
	set_weight(10000);
	set("unit", "把");
	set("long", @LONG
这是一把银光雪亮的伏魔杖，流苏闪动，耀人耳目。此乃数百年前由
达摩老祖携入中原，一路用之除妖灭魔，乃是佛家无上降魔法宝。
LONG );
	set("value", 1000000);
        set("no_sell", 1);
	set("material", "steel");
	set("wield_msg", HIY "只听「铮」的一声，伏魔杖腾空而出，自行跃入$N掌中。
瞬时天际间风云变色，电闪雷鸣，弥漫着一片无边杀意。\n" NOR);
	set("unwield_msg", HIY "伏魔杖自$N掌中飞起，在半空中一转，「唰」地靠在$N身后。\n" NOR);
	init_staff(200);
        set("stable", 100);
	setup();
        check_clone();
}
