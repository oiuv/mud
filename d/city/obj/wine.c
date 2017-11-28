// wine.c

inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name("酒杯", ({"wine"}));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "还没定义，等下层调用。\n");
		set("unit", "杯");
		set("value", 100);
		set("no_get", "1");
		set("max_liquid", 5);
	}

	set("liquid", ([
		"type": "alcohol",
		"name": "米酒",
		"remaining": 5,
		"supply": 15,
		"drunk_apply": 3,
	]));
}
