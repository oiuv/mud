// Npc: /kungfu/class/shaolin/xu-tong.c
// Date: YZC 96/01/19

inherit NPC;


void create()
{
	set_name("虚通", ({
		"xu tong",
		"xu",
		"tong",
	}));
	set("long",
		"他是一位身穿黄布袈裟的青年僧人。脸上稚气未脱，身手却已相\n"
		"当矫捷，看来似乎学过一点武功。\n"
	);


	set("nickname", "知客僧");
	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 20);
	set("shen_type", 1);
	set("str", 20);
	set("int", 20);
	set("con", 20);
	set("dex", 20);
	set("max_qi", 500);
	set("max_jing", 300);
	set("neili", 500);
	set("max_neili", 500);
	set("jiali", 100);
	set("combat_exp", 2000);
	set("score", 100);

	set_skill("force", 20);
	set_skill("shaolin-xinfa", 20);
	set_skill("dodge", 20);
	set_skill("shaolin-shenfa", 20);
	set_skill("strike", 20);
	set_skill("banruo-zhang", 20);
	set_skill("parry", 20);
	set_skill("sword", 20);
	set_skill("damo-jian", 20);

	map_skill("force", "shaolin-xinfa");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("strike", "banruo-zhang");
	map_skill("parry", "damo-jian");
	map_skill("sword", "damo-jian");

	prepare_skill("strike", "banruo-zhang");

	create_family("少林派", 41, "弟子");

	setup();

        carry_object("/d/shaolin/obj/xu-cloth")->wear();
}



