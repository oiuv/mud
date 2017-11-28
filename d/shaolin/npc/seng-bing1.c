// Npc: /d/shaolin/npc/seng-bing1.c
// Date: YZC 96/01/19

inherit NPC;


void create()
{
	set_name("护林僧兵", ({
		"seng bing",
		"seng",
		"bing",
	}));
	set("long",
		"他是一位身材高大的青年僧人，两臂粗壮，膀阔腰圆。他手持兵\n"
		"刃，身穿一袭白布镶边袈裟，似乎有一身武艺。\n"
	);

	set("gender", "男性");
	set("attitude", "aggressive");
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
	set("pursuer", 1);
	set("combat_exp", 2000);
	set("score", 1);

	set_skill("force", 30);
	set_skill("hunyuan-yiqi", 30);
	set_skill("dodge", 30);
	set_skill("shaolin-shenfa", 30);
	set_skill("unarmed", 30);
	set_skill("banruo-zhang", 30);
	set_skill("parry", 30);
	set_skill("blade", 30);
	set_skill("cibei-dao", 30);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("unarmed", "banruo-zhang");
	map_skill("parry", "cibei-dao");
	map_skill("blade", "cibei-dao");

	setup();

	carry_object("/d/shaolin/obj/jiedao")->wield();
	carry_object("/d/shaolin/obj/cloth")->wear();
}


void init()
{
	object ob = this_player();
	
	::init();

	if (interactive(ob))
	{
		remove_call_out("kill_ob");
		call_out("kill_ob", 1, ob); 
	}       
}

