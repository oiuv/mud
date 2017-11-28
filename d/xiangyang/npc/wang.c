// wang.c 王坚
#include <ansi.h>;
inherit NPC;


void create()
{
	set_name("王坚", ({ "wang jian", "wang", "jian" }));
	set("gender", "男性");
	set("title", HIY"襄阳守备大将"NOR);
	set("age", 40);
	set("str", 35);
	set("dex", 36);
	set("long", "这是一个大宋襄阳守备主将，满脸征尘。\n");
	set("combat_exp", 150000);
	set("shen_type", 1);
	set("attitude", "peaceful");

	set_skill("unarmed", 80);
	set_skill("force", 80);
	set_skill("sword", 80);
	set_skill("dodge", 80);
	set_skill("parry", 80);
	set_skill("changquan", 80);
	map_skill("unarmed", "changquan");
	map_skill("parry", "changquan");
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 100);
	set_temp("apply/armor", 100);
	set_temp("apply/damage", 100);

	set("neili", 1000); 
	set("max_neili", 1000);
	set("jiali", 100);

	setup();
	carry_object("/clone/weapon/gangjian")->wield();
	carry_object("/d/city/npc/obj/tiejia")->wear();
}

