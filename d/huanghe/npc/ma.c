// ma.c

inherit NPC;
#include <ansi.h>;
void create()
{
	set_name("马青雄", ({ "ma qingxiong", "ma", "qingxiong" }));
	set("gender", "男性");
	set("title", HIY"黄河四鬼老三"NOR);
	set("nickname", HIC"夺魄鞭"NOR);
	set("age", 32);
	set("str", 25);
	set("per", 15);
	set("dex", 16);
	set("long", "马青雄是黄河四鬼的老三，是鬼门龙王沙通天的三弟子，擅
于鞭法。\n");
	set("combat_exp", 20000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("unarmed", 30);
	set_skill("force", 30);
	set_skill("whip", 30);
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
	carry_object("/clone/weapon/changbian")->wield();
	carry_object("/clone/misc/cloth")->wear();
}

