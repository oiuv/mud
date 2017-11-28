#include <ansi.h>
inherit SNAKE;

void create()
{
        set_name(NOR + YEL "金蛇" NOR, ({ "jin she", "jin", "she" }));
        set("long", YEL "这是一条几寸长的小蛇，通体金黄。\n" NOR);

        set("age", 15);
        set("str", 30);
        set("dex", 50);
        set("con", 30);
	set("max_qi", 3000);
	set("max_jing", 3000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("combat_exp", 3000000);

        set_skill("unarmed", 300);
        set_skill("dodge", 300);
        set_skill("parry", 300);
        set_skill("force", 300);

        set("snake_poison", ([
                "level"  : 300,
                "perhit" : 100,
                "remain" : 250,
                "maximum": 250,
                "supply" : 50,
        ]));

        set("power", 200);
        set("item1", "/clone/quarry/item/sherou");
        set("item2", "/clone/herb/shedan");

        set_temp("apply/attack",  300);
        set_temp("apply/unarmed_damage", 200);
        set_temp("apply/defense", 600);
        set_temp("apply/armor",   200);

        setup();
}

void unconcious()
{
        this_object()->die();
}
