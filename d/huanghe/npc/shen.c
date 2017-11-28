// shen.c

inherit NPC;
#include <ansi.h>;
void create()
{
	set_name("沈青刚", ({ "shen qinggang", "shen", "qinggang" }));
	set("gender", "男性");
	set("title", HIY"黄河四鬼老大"NOR);
	set("nickname", HIC"断魂刀"NOR);
	set("age", 32);
	set("str", 25);
	set("dex", 16);
	set("per", 16);
	set("long", "沈青刚是黄河四鬼的老大，是鬼门龙王沙通天的大弟子，擅
使单刀。\n");
	set("combat_exp", 20000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("unarmed", 30);
	set_skill("force", 30);
	set_skill("blade", 30);
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
	carry_object("/clone/weapon/gangdao")->wield();
	carry_object("/clone/misc/cloth")->wear();
}

