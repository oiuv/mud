// hdjiudai.c  花雕酒袋

inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name("花雕酒袋", ({"jiudai", "skin", "huadiao"}));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一个用来装高级花雕酒的大酒袋。\n");
		set("unit", "个");
		set("value", 120);
		set("max_liquid", 20);
	}

	// because a container can contain different liquid
	// we set it to contain wine at the beginning
	set("liquid", ([
		"type": "alcohol",
		"name": "花雕酒",
		"remaining": 20,
		"drunk_apply": 6,
	]));
}

