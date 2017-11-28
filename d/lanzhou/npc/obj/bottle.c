inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name("水壶", ({"water bottle", "bottle"}));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一个不知道用什么动物的皮制成的水壶。\n");
		set("unit", "个");
		set("value", 100);
		set("max_liquid", 10);
	}
	set("liquid", ([
		"type": "water",
		"name": "清水",
		"remaining": 10,
		
	]));
}

