#include <ansi.h>
inherit SNAKE;

void create()
{
        set_name(HIR "腹蛇" NOR, ({ "fu she", "fu", "she" }));
        set("long", HIR "只见它全身血红，头呈三角，长蛇吞吐，嗤嗤做响。\n" NOR);

        set("age", 3);
        set("str", 35);
        set("dex", 50);
        set("max_qi", 1500);
        set("max_ging", 1500);
        set("combat_exp", 150000);

        set("snake_poison", ([
                "level"  : 120,
                "perhit" : 10,
                "remain" : 50,
                "maximum": 50,
                "supply" : 1,
        ]));

        set("power", 22);
        set("item1", "/clone/quarry/item/sherou");
        set("item2", "/clone/herb/shedan");

        set_temp("apply/parry", 100);
        set_temp("apply/dodge", 100);
        set_temp("apply/attack", 80);
        set_temp("apply/defense", 100);
        set_temp("apply/unarmed_damage", 80);
        set_temp("apply/armor", 100);

        setup();
}
