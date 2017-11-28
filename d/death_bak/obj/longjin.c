#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIW "龙筋" NOR, ({ "long jin", "jin"}));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", HIW "一根从神兽青龙身上取出的筋，相当的坚韧。晶莹剔透，隐然泛出白光。\n" NOR);
		set("unit", "根");
		set("value", 200000);
              set("item_origin", 1);
              set("material_attrib", "silk");
              set("material_name", HIW "龙筋" NOR);
              set("can_make", ({ "鞭" }));
              set("power_point", 120);
	}
}

