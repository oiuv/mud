inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name("木澡盆", ({"zaopen"}));
        set_weight(500000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "木头的澡盆,已经很陈旧。\n");
                set("unit", "只");
                set("value", 100);
                set("max_liquid", 15);
        }
        set("liquid", ([
                "type": "alcohol",
                "name": "洗澡水",
                "remaining": 15,
                "drunk_apply": 3,
        ]));
}

