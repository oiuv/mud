// water.c

inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name("杯盏", ({"water"}));
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
		"type": "water",
		"name": "清水",
		"remaining": 5,
		"supply": 10,
		"drunk_apply": 3,
	]));
}
