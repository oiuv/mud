// flagon.c  酒壶

inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name("酒壶", ({"jiu hu", "hu", "flagon"}));
        set_weight(700);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一个用来装烧酒的大酒壶。\n");
                set("unit", "个");
                set("value", 100);
                set("max_liquid", 15);
        }

        set("liquid", ([
                "type": "alcohol",
                "name": "烧酒",
                "remaining": 15,
                "drunk_apply": 3,
                "slumber_effect": 100,
        ]));
}
