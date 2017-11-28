// bangzong.c

inherit NPC;

#include <ansi.h>;
void create()
{
	set_name("大汉", ({ "da han", "han" }));
	set("gender", "男性");
	set("title", HIY"黄河帮帮众"NOR);
	set("age", 22);
	set("str", 25);
	set("per", 15);
	set("dex", 16);
	set("long", "一名身材高大的壮汉，满脸杀气，一付凶神恶煞的模样。\n");
	set("combat_exp", 2000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("unarmed", 30);
	set_skill("force", 30);
	set_skill("axe", 30);
	set_skill("dodge", 30);
	set_skill("parry", 30);

	set("neili", 100); 
	set("max_neili", 100);
	set("jiali", 10);

	setup();
	carry_object("/clone/misc/cloth")->wear();
}

