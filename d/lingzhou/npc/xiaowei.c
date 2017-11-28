// xiaowwei.c

inherit NPC;


void create()
{
	set_name("校尉", ({ "xiao wei", "wei" }));
	set("gender", "男性");
	set("age", random(10) + 20);
	set("str", 25);
	set("dex", 16);
	set("long", "一个魁武的西夏军官。\n");
	set("combat_exp", 50000);
	set("shen_type", 1);
	set("attitude", "peaceful");

	set_skill("unarmed", 60);
	set_skill("force", 60);
	set_skill("dodge", 60);
	set_skill("parry", 60);
	set_temp("apply/attack", 30);
	set_temp("apply/defense", 30);
	set_temp("apply/armor", 30);
	set_temp("apply/damage", 30);

	set("neili", 100); 
	set("max_neili", 100);
	set("jiali", 10);

	setup();
	carry_object("/clone/cloth/junfu")->wear();
	carry_object("/clone/weapon/wandao")->wield();
}

