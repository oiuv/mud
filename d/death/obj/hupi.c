#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIW "白虎皮" NOR, ({ "baihu pi", "pi"}));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", HIW "一张从神兽白虎身上剥下的皮，雪白无暇，无比的坚韧。\n" NOR);
		set("unit", "张");
		set("value", 1000000);
              set("item_origin", 1);
              set("material_attrib", "silk");
              set("material_name", HIW "白虎毛皮" NOR);
              set("can_make", ({ "战衣" }));
              //set("power_point", 120);
			  set("power_point", 40);
	}
}

int query_autoload()
{
        return 1;
}