//shanchahua.c
inherit ITEM;
#include <ansi.h>

void create()
{
	set_name(HIR"山茶花"NOR, ({"cha hua", "hua"}));
	set("unit", "朵");
	set("long", "一株盛开的茶花，几朵不同色的大花开放在一枝，看来定然十分名贵不是凡品。\n");
	set("value", 10);
	setup();
}

