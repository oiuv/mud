#include <ansi.h>
inherit SNAKE;

void create()
{
        set_name(HIG "毒蛇" NOR, ({ "du she", "du", "she" }));
        set("long", HIG "一支昂首吐信的毒蛇正虎视眈眈地盯著你。\n" NOR);

        set("age", 1);
        set("str", 15);
        set("dex", 50);
        set("max_qi", 500);
        set("max_ging", 500);
        set("combat_exp", 8000);

        set("snake_poison", ([
                "level"   : 80,
                "remain"  : 20,
                "maximum" : 20,
                "perhit"  : 10,
                "supply"  : 1,
        ]));

        set("power", 12);
        set("item1", "/clone/quarry/item/sherou");
        set("item2", "/clone/herb/shedan");

        set_temp("apply/dodge", 100);
        set_temp("apply/defense", 100);
        set_temp("apply/unarmed_damage", 50);

        setup();
}
