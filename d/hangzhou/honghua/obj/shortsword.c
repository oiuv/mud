// shortsword.c

#include <weapon.h>
#include <ansi.h>
inherit SWORD;

void create()
{
	set_name(HIC"短剑"NOR, ({ "short sword", "sword", "jian" }));
	set_weight(5000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄的短剑，据说剑里藏着一个极大秘密，几
百年来辗转相传，始终无人参详得出。\n");
		set("value", 100);
		set("material", "steel");
		set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回剑鞘。\n");
	}
	init_sword(25);
	setup();
}
