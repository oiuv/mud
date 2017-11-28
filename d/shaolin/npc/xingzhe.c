// walker.c
// Date: YZC 96/01/19
// Date: Cleansword 96/02/05

inherit NPC;

void create()
{
	set_name("行者", ({"xingzhe","walker",}));
	set("title", "少林派弟子");
	set("long",
		"他是一位云游四方的行者，风霜满面，行色匆匆，似乎正在办一件急事。\n"
	);

	set("gender", "男性");
	set("attitude", "heroism");
	set("class", "bonze");

	set("chat_chance", 10);
	set("chat_msg",({
		(: this_object(), "random_move" :),
	}));

	set("age", 35);
	set("shen_type", 1);
	set("str", 25);
	set("int", 20);
	set("con", 20);
	set("dex", 25);
	set("max_qi", 500);
	set("max_jing", 100);
	set("neili", 500);
	set("max_neili", 500);
	set("jiali", 100);
	set("combat_exp", 20000);
	set("score", 100);
	set("apply/attack",  30);
	set("apply/defense", 30);

	set_skill("force", 50);
	set_skill("unarmed", 50);
	set_skill("blade", 50);
	set_skill("dodge", 50);
	set_skill("parry", 50);
	set_skill("shaolin-shenfa", 50);
	set_skill("cibei-dao", 50);
	set_skill("hunyuan-yiqi", 50);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("blade", "cibei-dao");
	map_skill("parry", "cibei-dao");

	create_family("少林派", 0, "弟子");

	setup();
	carry_object("/d/city/obj/gangdao")->wield();
	carry_object("/clone/misc/cloth")->wear();
	add_money("silver", 50);
}

int random_move()
{
	object where;
	mapping exits;
	string *dirs;

	where = environment();

	command("say 师父叫我在此办一件大事。");
	
	/* trapped */
	if( !mapp(exits = where->query("exits")) )
		return 0;
		
	if ( (string)file_name(where) == "/d/village/hsroad2" )
	{
		command("go south");
		return 1;
	}

	if ( (string)file_name(where) == "/d/wudang/wdroad5" )
	{
		command("go north");
		return 1;
	}
	
	dirs = keys(exits);
	if (sizeof(dirs) < 2)
	{
		command("go " + dirs[0]);
	}
	else
	{
		command("go " + dirs[random(sizeof(dirs))]);
	}
	return 1;
}
