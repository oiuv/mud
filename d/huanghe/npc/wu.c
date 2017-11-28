// wu.c

inherit NPC;
#include <ansi.h>;
void create()
{
	set_name("吴青烈", ({ "wu qinglie", "wu", "qinglie" }));
	set("gender", "男性");
	set("title", HIY"黄河四鬼老二"NOR);
	set("nickname", HIC"追命枪"NOR);
	set("age", 32);
	set("str", 25);
	set("dex", 16);
	set("per", 21);
	set("long", "吴青烈是黄河四鬼的老二，是鬼门龙王沙通天的二弟子，擅
使长枪。\n");
	set("combat_exp", 20000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("unarmed", 30);
	set_skill("force", 30);
	set_skill("club", 30);
	set_skill("dodge", 30);
	set_skill("parry", 30);
	set_temp("apply/attack", 50);
	set_temp("apply/defense", 50);
	set_temp("apply/armor", 50);
	set_temp("apply/damage", 30);

	set("neili", 400); 
	set("max_neili", 400);
	set("jiali", 10);

	setup();
	carry_object("/clone/weapon/changqiang")->wield();
	carry_object("/clone/misc/cloth")->wear();
}

