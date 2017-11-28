#include <ansi.h>
inherit SNAKE;

void create()
{
        set_name(HIC "菜花蛇" NOR, ({ "caihua she", "caihua", "she" }));
        set("long", HIC "这是一只青幽幽的菜花蛇，头部呈椭圆形。\n" NOR);

        set("age", 1);
        set("str", 15);
        set("dex", 16);
	set("max_qi", 200);
	set("max_jing", 200);
        set("combat_exp", 1000);

        set("power", 8);
        set("item1", "/clone/quarry/item/sherou");
        set("item2", "/clone/herb/shedan");

        set_temp("apply/dodge", 80);
        set_temp("apply/defense", 80);
        set_temp("apply/unarmed_damage", 50);

        setup();
}
