#include <ansi.h>
inherit SNAKE;

void create()
{
        set_name(HIR "眼镜蛇" NOR, ({ "yanjing she", "yanjing", "she" }));
        set("long", HIR "这是一条五彩斑斓的眼镜蛇，毒性猛烈之极。\n" NOR);

        set("age", 3);
        set("str", 35);
        set("dex", 50);
        set("max_qi", 1800);
        set("max_ging", 1800);
        set("combat_exp", 200000);

        set("snake_poison", ([
                "level"  : 150,
                "perhit" : 50,
                "remain" : 80,
                "maximum": 80,
                "supply" : 3,
        ]));

        set("power", 28);
        set("item1", "/clone/quarry/item/sherou");
        set("item2", "/clone/herb/shedan");

        set_temp("apply/parry", 120);
        set_temp("apply/dodge", 120);
        set_temp("apply/attack", 120);
        set_temp("apply/defense", 180);
        set_temp("apply/unarmed_damage", 180);
        set_temp("apply/armor", 180);

        setup();
}
