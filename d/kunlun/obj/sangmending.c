// sanmending.c 丧门钉
// cck 17/6/97

#include <weapon.h>
inherit THROWING;

void create()
{
	set_name("丧门钉", ({ "sangmen ding", "ding" }));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "把");
		set("long", "这是一玫丧门钉，似乎喂的是“青陀罗花”的毒汁。\n");
		set("value", 1);
		set("material", "steel");
		set("wield_msg", "$N抓出一把丧门钉扣在手心。\n");
		set("unwield_msg", "$N将手中的丧门钉放回装暗器的皮囊里。\n");
		set("base_unit", "枚");
		set("base_weight", 2);
	    set("poisoned", "qtlh_poi");
        set("poison_number", 6);

	}
	set_amount(random(5) + 10);
	init_throwing(10);
	setup();
}
