// Npc: /kungfu/class/shaolin/seng-bing.c
// Date: YZC 96/01/19

inherit NPC;

void beat_faint(object ob);

int is_ghost() { return 1; }

void create()
{
	set_name("打手", ({
		"da shou",
		"da",
		"shou",
	}));
	set("long",
		"他是一位身穿黄布袈裟的青年僧人。脸上稚气未脱，\n"
		"身手却已相当矫捷，看来似乎学过一点武功。\n"
	);


	set("gender", "男性");
	set("attitude", "peaceful");
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

	set_skill("force", 25);
	set_skill("hunyuan-yiqi", 25);
	set_skill("dodge", 25);
	set_skill("shaolin-shenfa", 25);
	set_skill("unarmed", 25);
	set_skill("banruo-zhang", 25);
	set_skill("parry", 25);
	set_skill("sword", 25);
	set_skill("damo-jian", 25);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("unarmed", "banruo-zhang");
	map_skill("parry", "damo-jian");
	map_skill("sword", "damo-jian");

	setup();
}

void init()
{       
	object ob;

	::init();
	if( interactive(ob = this_player()) && !is_fighting() )
	{
		remove_call_out("beat_faint");
		call_out("beat_faint", 1, ob);
	}
}

void beat_faint(object ob)
{
	if( !ob || environment(ob) != environment() )
		return;

//	ob->add("qi", -ob->query("qi")-1);
	ob->unconcious();
	ob->move("/d/shaolin/jianyu");
}
