// zhixiang.c 制香
inherit NPC;

void create()
{
	set_name("制香道长", ({ "zhixiang daozhang", "zhixiang" }));
	set("long", 
		"他是武当山的制香道长, 兼在这里出售香烛。\n");
	set("gender", "男性");
	set("age", 30);
	set("attitude", "peaceful");
	set("shen_type", 1);

	set("str", 20);
	set("int", 20);
	set("con", 25);
	set("dex", 20);
	
	set("max_qi", 400);
	set("max_jing", 200);
	set("neili", 500);
	set("max_neili", 500);

	set("combat_exp", 7500);
	set("score", 1000);

	set_skill("force", 40);
        set_skill("wudang-xinfa", 40);
	set_skill("dodge", 40);
	set_skill("strike", 40);
	set_skill("wudang-zhang", 40);
	set_skill("parry", 40);
	set_skill("sword", 40);
	set_skill("wudang-jian", 20);
	set_skill("taoism", 20);

	map_skill("parry", "wudang-jian");
	map_skill("sword", "wudang-jian");
	map_skill("strike", "wudang-zhang");

	prepare_skill("strike", "wudang-zhang");

	create_family("武当派", 4, "弟子");

	setup();
	carry_object("/clone/weapon/changjian")->wield();
}
