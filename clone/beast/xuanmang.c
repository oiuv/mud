#include <ansi.h>
inherit SNAKE;

#define NAME    HIW "玄冰" HIR "赤" HIW "蟒" NOR

void create()
{
        set_name(NAME, ({ "xuanbing chimang", "xuan", "bing", "xuanbing",
                          "chimang", "mang", "snake" }));
        set("long", HIW @LONG
这是一只雪山怪蛇，只见它通体雪白，眼如烈
炎。看来这个冰洞是它的巢穴。
LONG NOR);

        set("age", 15);
        set("str", 50);
        set("dex", 50);
        set("con", 100);
	set("max_qi", 20000);
	set("max_jing", 20000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("combat_exp", 5000000);

        set_skill("unarmed", 500);
        set_skill("dodge", 500);
        set_skill("parry", 500);
        set_skill("force", 500);

        set("snake_poison", ([
                "level"  : 300,
                "perhit" : 200,
                "remain" : 300,
                "maximum": 300,
                "supply" : 30,
        ]));

        set("power", 300);
        set("item1", "/clone/quarry/item/sherou");
        set("item2", "/clone/herb/shedan");
        set("item3", "/clone/fam/pill/blood");

        set_temp("apply/attack",  500);
        set_temp("apply/unarmed_damage", 300);
        set_temp("apply/defense", 500);
        set_temp("apply/armor",   300);

        setup();
}

void unconcious()
{
        this_object()->die();
}
