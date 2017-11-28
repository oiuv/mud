inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name("Áú¾®²è", ({"longjing tea", "tea"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»¸öÀ¶±ß´Ö´Å´óÍë£¬ÀïÃæÊ¢ÂúÁËÁú¾®²è¡£\n");
		set("unit", "Íë");
		set("value", 4);
        set("max_liquid", 4);
    }
    set("liquid", ([
        "type": "tea",
        "name": "²èË®",
        "remaining": 4,
        "drunk_supply": 0,
    ]));
}
