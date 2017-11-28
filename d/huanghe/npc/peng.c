// peng.c

inherit NPC;
#include <ansi.h>;
void create()
{
	set_name("彭连虎", ({ "peng lianhu", "peng", "lianhu" }));
	set("gender", "男性");
	set("nickname", HIR"千手人屠"NOR);
	set("age", 43);
	set("str", 25);
	set("dex", 16);
	set("per", 20);
	set("long", "彭连虎五短身材，满眼红丝，目光如电，上唇短须翘起。他生性
残暴，和沙通天有深厚的交情。\n");
	set("combat_exp", 200000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("unarmed", 60);
	set_skill("force", 60);
	set_skill("dagger", 60);
	set_skill("dodge", 60);
	set_skill("parry", 60);
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 100);
	set_temp("apply/armor", 100);
	set_temp("apply/damage", 100);

	set("neili", 800); 
	set("max_neili", 800);
	set("jiali", 50);

	setup();
	carry_object(__DIR__"obj/bi")->wield();
	carry_object("/d/city/obj/beixin")->wear();
}

