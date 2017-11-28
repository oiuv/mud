#include <weapon.h>
inherit WHIP;

void create()
{
	set_name("钓杆", ({ "diao gan", "diao", "gan" }));
	set_weight(5000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "根");
		set("long", "这是一根细长的铁杆，猛然一看不过是根普通钓鱼用的吊杆。\n");
		set("value", 1500);
		set("rigidity",100);
		set("material", "steel");
		set("wield_msg", "$N抽出一根$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回腰间。\n");
	}
  	init_whip(30);
	setup();
}
