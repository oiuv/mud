// putuan.c 小蒲团

inherit ITEM;

void create()
{
	set_name("小蒲团", ({ "putuan", "pu", "tuan" }));
	set_weight(500);
	set_max_encumbrance(10000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "个");
		set("long", "一个普通的小蒲团。\n");
		set("value", 100);
	}
}

int is_container() { return 1; }
