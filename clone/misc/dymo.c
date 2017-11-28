// dymo.c 丹玉磨

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIG "丹玉磨" NOR, ({ "danyu mo", "mo" }));
	set_weight(1200);
	set_max_encumbrance(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
		set("long", "一只用玉磨成的小碗，颇为沉重，由于玉的特殊质地，所以用
来炼药可以获得更好的效果。\n");
		set("value", 20000);
                set("item_prop/medical", 100);
	}
}

int is_container() { return 1; }

int can_make_medicine() { return 1; }
