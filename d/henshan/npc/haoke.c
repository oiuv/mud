// haoke.c 豪客

inherit NPC;

void create()
{
	set_name("江湖豪客", ({ "jianghu haoke", "haoke" }));
	set("long", 
		"一名满脸彪捍之色的江湖豪客。\n");
	set("gender", "男性");
	set("age", 30);
	set("attitude", "heroism");
	set("shen_type", 1);

	set("str", 20);
	set("int", 20);
	set("con", 25);
	set("dex", 20);
	
	set("max_qi", 300);
	set("max_jing", 200);
	set("neili", 300);
	set("max_neili", 300);

	set("combat_exp", 2000);

	set_skill("force", 40);
	set_skill("dodge", 40);
	set_skill("unarmed", 40);
	set_skill("parry", 40);
	set_skill("sword", 40);

	setup();
	carry_object("/clone/weapon/changjian")->wield();
}
