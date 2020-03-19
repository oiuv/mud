#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + CYN "黑熊" NOR, ({ "hei xiong", "hei", "xiong" }));
	set("long", CYN "这是一只身材巨大，凶猛异常的黑熊。\n" NOR);

	set("age", 8);
        set("str", 50);
        set("dex", 20);
        set("con", 50);
        set("max_qi", 6000);
        set("max_jing", 6000);
        set("neili", 3500);
        set("max_neili", 3500);
        set("combat_exp", 500000);

        set("power", 50);
        set("item1", __DIR__"item/xiongrou");
        set("item2", __DIR__"item/xiongpi");
        set("item3", "/clone/herb/xiongdan");

        set_temp("apply/force", 220);
        set_temp("apply/parry", 220);
        set_temp("apply/dodge", 220);
        set_temp("apply/attack", 250);
        set_temp("apply/defense", 250);
        set_temp("apply/unarmed_damage", 280);
        set_temp("apply/armor", 280);

	setup();
}
