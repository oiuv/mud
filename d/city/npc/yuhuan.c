// yuhuan.c 程玉环 

inherit NPC;

void create()
{
	set_name("程玉环", ({ "cheng yuhuan", "cheng", "yuhuan" }));
	set("long", 
		"她就是程知府的独生女儿，长得如花似玉，貌赛天仙的程玉环。\n"
		"据说她曾经在武当门下学过剑法。\n");
		
	set("title", "知府千金");
	set("nickname", "玉仙姑");
	set("gender", "女性");
	set("age", 18);
	set("shen_type", 1);

	set("neili", 400);
	set("max_neili", 400);
	set("max_qi", 400);
	set("max_jing", 200);
	set("jiali", 10);

	set_skill("force", 50);
	set_skill("unarmed", 40);
	set_skill("dodge", 60);
	set_skill("parry", 60);
	set_skill("sword", 60);
	set_skill("taiji-jian", 40);
	map_skill("sword", "taiji-jian");
	map_skill("parry", "taiji-jian");

	set_temp("apply/attack", 20);
	set_temp("apply/defense", 20);
	set_temp("apply/damage", 15);

	set("combat_exp", 50000);

	setup();
	carry_object(__DIR__"obj/goldring")->wear();
	carry_object(__DIR__"obj/necklace")->wear();
	carry_object(__DIR__"obj/changjian")->wield();
	carry_object(__DIR__"obj/pink_cloth")->wear();
	carry_object(__DIR__"obj/flower_shoe")->wear();
}
