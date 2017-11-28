#include <ansi.h>
#include <weapon.h>

inherit HAMMER;

void create()
{
	set_name(WHT "雷震挡" NOR, ({"leizhen dang", "leizhen", "dang"}));
	set_weight(8000);

	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "杆");
		set("long", WHT "一杆十分沉重的雷震挡。\n" NOR);
		set("value", 10000);
                set("material", "iron");
		set("wield_msg", WHT "$N" WHT "回手从身后抽出一杆雷震挡。\n" NOR);
		set("unwield_msg", WHT "$N" WHT "手往后一扣，把雷震挡放在身后。\n" NOR);
	}
	init_hammer(60);
	setup();
}
