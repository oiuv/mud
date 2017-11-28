// ruzhu.c 片皮乳猪

#include <ansi.h>

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name(HIY "片皮乳猪" NOR, ({"ruzhu"}));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "鸡豆花色白细嫩，汤清味鲜，源于豆花，高于豆花，
被誉名为“豆花不用豆，吃鸡不见鸡”的佳肴美馔。\n");
		set("unit", "只");
		set("value", 300);
		set("food_remaining", 5);
		set("food_supply", 100);
	}
}