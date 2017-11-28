inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name("盖碗茶", ({"gaiwan tea", "tea"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一个蓝边粗磁大碗，里面盛满了茶水。\n");
		set("unit", "个");
		set("value", 2);
        set("max_liquid", 4);
    }
    set("liquid", ([
        "type": "tea",
        "name": "茶水",
        "remaining": 4,
        "drunk_supply": 0,
    ]));
}
