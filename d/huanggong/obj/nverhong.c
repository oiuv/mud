// nverhong.c 女儿红

inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name("女儿红", ({"nver hong", "wine"}));
        set_weight(700);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一坛上好的女儿红,醇香诱人.\n");
                set("unit", "坛");
                set("value", 500);
                set("max_liquid", 15);
        }

        // because a container can contain different liquid
        // we set it to contain wine at the beginning
        set("liquid", ([
                "type": "alcohol",
                "name" : "女儿红酒",
                "remaining": 3,
                "drunk_supply": 6,
        ]));
}

