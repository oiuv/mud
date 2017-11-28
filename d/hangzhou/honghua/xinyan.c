// xinyan.c 心砚

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("心砚", ({ "xin yan", "yan" }));
	set("title", HIR "红花会"HIG"书僮" NOR);
	set("long", 
"他是红花会总舵主陈家洛的贴身书僮。\n");
	set("gender", "男性");
	set("class", "scholar");
	set("age", 15);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("per", 25);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	
	set("max_qi", 1000);
	set("max_jing", 500);
	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 100);
	set("combat_exp", 100000);

	set_skill("force", 60);
	set_skill("dodge", 60);
	set_skill("unarmed", 60);
	set_skill("parry", 60);
	set_skill("whip", 60);
	set_skill("claw", 60);
	set_skill("hand", 60);
	set_skill("yunlong-shengong", 60);
	set_skill("yunlong-bian", 60);
	set_skill("yunlong-jian", 60);
	set_skill("yunlong-shenfa", 50);
	set_skill("yunlong-shou", 50);
	set_skill("yunlong-zhua", 50);

	map_skill("dodge", "yunlong-shenfa");
	map_skill("force", "yunlong-shengong");
	map_skill("hand", "yunlong-shou");
	map_skill("parry", "yunlong-bian");
	map_skill("claw", "yunlong-zhua");
	map_skill("sword", "yunlong-jian");
	map_skill("whip", "yunlong-bian");

	prepare_skill("hand","yunlong-shou");
	prepare_skill("claw","yunlong-zhua");
	set("env/wimpy", 60);

 	setup();
	carry_object("/clone/misc/cloth")->wear();
	carry_object("/clone/weapon/changbian")->wield();
}

