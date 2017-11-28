// gangzhang.c 钢杖

#include <weapon.h>
inherit STAFF;

void create()
{
	set_name("钢杖", ({ "gangzhang" }));
	set_weight(5000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "根");
		set("long", "这是一根粗重的钢杖，是星宿派专用之物。\n");
		set("value", 1500);
		set("material", "steel");
		set("wield_msg", "$N抽出一根$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回腰间。\n");
	}
  	init_staff(25);
	setup();
}
