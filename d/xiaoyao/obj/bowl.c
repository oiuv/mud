// bowl.c

inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name("水碗", ({ "wan", "bowl" }) );
        set_weight(400);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "这是一个水碗，里面有什么呢？当然是水啦。\n");
                set("unit", "个");
                set("value", 0);
                set("max_liquid", 60);
        }

        // The liquid contained in the container is independent, we set a copy
        // in each cloned copy.
        set("liquid", ([
                "type": "water",
                "name": "水",
                "remaining": 60,
        ]) );
}