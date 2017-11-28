// fenshuici.c

#include <weapon.h>
inherit DAGGER;

void create()
{
	set_name("分水刺", ({ "fenshui ci", "ci" }));
	set_weight(7000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一只水中分水峨嵋刺。\n");
		set("value", 1000);
		set("material", "steel");
		set("wield_msg", "$N「唰」的一声抽出一只$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回袖中。\n");
	}
	init_dagger(5);
	setup();
}

