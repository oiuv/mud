#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + CYN "大象" NOR, ({ "da xiang", "da", "xiang" }));
	set("long", CYN "这是一只房间大小的巨象，威猛之极。\n" NOR);
        set("no_auto_kill", 1);

	set("age", 3);
	set("str", 100);
	set("con", 100);
	set("dex", 50);
	set("max_qi", 12000);
	set("max_jing", 12000);
        set("neili", 6000);
        set("max_neili", 6000);
	set("combat_exp", 2000000);

        set_skill("unarmed", 300);
        set_skill("dodge", 300);
        set_skill("parry", 300);
        set_skill("force", 300);

        set("power", 200);
        set("item1", __DIR__"item/xiangrou");
        set("item2", __DIR__"item/xiangya");

        set_temp("apply/attack", 350);
        set_temp("apply/defense", 350);
        set_temp("apply/unarmed_damage", 800);
        set_temp("apply/armor", 800);

	setup();
}
