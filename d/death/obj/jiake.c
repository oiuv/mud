#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(CYN "玄武甲壳" NOR, ({ "xuanwu jiake", "jiake"}));
	set_weight(25000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", CYN "一块神兽玄武的甲壳，相当的坚韧。\n" NOR);
		set("unit", "块");
		set("value", 120000);
              set("item_origin", 1);
              set("material_attrib", "silk");
              set("material_name", CYN "玄武甲壳" NOR);
              set("can_make", ({ "护甲" }));
              //set("power_point", 120);
			  set("power_point", 40);
	}
}

int query_autoload()
{
        return 1;
}