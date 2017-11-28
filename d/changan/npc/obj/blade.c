//blade.c

#include <weapon.h>

inherit BLADE;

void create()
{
	set_name("钢刀", ({"blade", "gangdao", "dao"}));
	set_weight(4000);
	if (clonep())
		set_default_object(__FILE__);
	else 
	{
		set("unit", "柄");
		set("value", 500);
		set("material", "iron");
		set("long", "这是一寻常的单刀，份量大约六、七斤重。\n");
		set("wield_msg", "$N抽出一把明晃晃的$n握在手中。\n");
		set("unequip_msg", "$N将手中的$n插入腰间的刀鞘。\n");
	}
	init_blade(25);

	setup();
}