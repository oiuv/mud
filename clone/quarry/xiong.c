#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + WHT "灰熊" NOR, ({ "hui xiong", "hui", "xiong" }));
	set("long", WHT "这是一只身材巨大，凶猛异常的灰熊。\n" NOR);

	set("age", 6);
        set("str", 50);
        set("dex", 20);
        set("con", 50);
        set("max_qi", 5000);
        set("max_jing", 5000);
        set("neili", 3000);
        set("max_neili", 3000);
        set("combat_exp", 300000);

        set("power", 45);
        set("item1", __DIR__"item/xiongrou");
        set("item2", __DIR__"item/xiongpi");
        set("item3", "/clone/herb/xiongdan");

        set_temp("apply/force", 200);
        set_temp("apply/parry", 200);
        set_temp("apply/dodge", 200);
        set_temp("apply/attack", 180);
        set_temp("apply/defense", 180);
        set_temp("apply/unarmed_damage", 220);
        set_temp("apply/armor", 220);

	setup();
}
