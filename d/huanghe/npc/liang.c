// liang.c

inherit NPC;
#include <ansi.h>;
void create()
{
	set_name("梁子翁", ({ "liang ziwen", "liang", "ziwen" }));
	set("gender", "男性");
	set("nickname", HIR"参仙"HIW"老怪"NOR);
	set("age", 43);
	set("str", 25);
	set("per", 20);
	set("dex", 16);
	set("long", "梁子翁身材中等，满头白发如银，但脸色光润，神采弈弈，穿一
件葛布长袍，打扮非道非俗。他是长白山武学的一派宗师。\n");
	set("combat_exp", 200000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("unarmed", 60);
	set_skill("force", 60);
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
	carry_object(__DIR__"obj/changpao")->wear();
}

