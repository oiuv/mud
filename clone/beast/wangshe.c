#include <ansi.h>
inherit SNAKE;

void create()
{
        set_name(NOR + RED "眼镜王蛇" NOR, ({ "yanjing wangshe", "yanjing",
                                              "wangshe", "she" }));
        set("long", RED "这是一条五彩斑斓的眼镜王蛇，毒性为万蛇之最。\n" NOR);

        set("age", 3);
        set("str", 35);
        set("dex", 50);
        set("max_qi", 2200);
        set("max_ging", 2200);
        set("combat_exp", 500000);

        set("snake_poison", ([
                "level"  : 200,
                "perhit" : 60,
                "remain" : 100,
                "maximum": 100,
                "supply" : 5,
        ]));

        set("power", 35);
        set("item1", "/clone/quarry/item/sherou");
        set("item2", "/clone/herb/shedan");

        set_temp("apply/parry", 150);
        set_temp("apply/dodge", 150);
        set_temp("apply/attack", 150);
        set_temp("apply/defense", 180);
        set_temp("apply/unarmed_damage", 180);
        set_temp("apply/armor", 180);

        setup();
}
