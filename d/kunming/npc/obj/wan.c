// dawancha.c 粗磁大碗
// By Marz 03/29/96

inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name("大碗茶", ({"wan", "da wan","ci wan"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一个粗磁大碗。\n");
		set("unit", "个");
		set("value", 0);
        set("max_liquid", 4);
    }

    // because a container can contain different liquid
    // we set it to contain tea at the beginning
    set("liquid", ([
        "type": "tea",
        "name": "茶水",
        "remaining": 4,
        "drunk_supply": 0,
    ]));
}
