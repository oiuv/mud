// spin.c 银针

#include <weapon.h>
#include <ansi.h>

inherit PIN;

void create()
{
	set_name(HIW "银针" NOR, ({ "pin", "silver pin", "yin zhen", "zhen" }));
	set_weight(24);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "根");
		set("long", "这是富贵人家才使用的银针。\n");
		set("value", 120);
		set("material", "silver");
		set("wield_msg", YEL "$N手一抖，亮出一根$n" YEL "。\n");
		set("unwield_msg", YEL "$N收起了$n" YEL "。\n");
	}

	init_pin(8);
	setup();
}
