// guoqiaomixian.c

inherit ITEM;
inherit F_FOOD;
#include <ansi.h>;

void create()
{
	set_name(HIG"叶儿粑"NOR, ({"ye er ba", "ba"}));
	set_weight(80);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "这是一块飘着清香的叶ㄦ粑。\n");
		set("unit", "碗");
		set("value", 100);
		set("food_remaining", 15);
		set("food_supply", 20);
	}
}
