// jiading.c 家丁

inherit NPC;

void create()
{
	set_name("家丁", ({ "jia ding", "jia" }));
	set("gender", "男性");
	set("age", 35);
	set("long", "归云庄家丁。\n");
	set("combat_exp", 40000);
        set_skill("dodge", 50);
        set_skill("unarmed", 50);
        set_temp("apply/attack",  50);
        set_temp("apply/defense", 50);
	set("shen_type", 1);
	setup();

	add_money("silver",3);
	carry_object("/clone/misc/cloth")->wear();
}

int accept_object(object who, object ob)
{
	if ((string)ob->query("id")=="guiyun shuxin")
	{
		command("bow "+this_player()->query("id"));
		this_player()->set_temp("marks/guiyun", 1);
		write("家丁说道：" + RANK_D->query_respect(ob) + "原来是少庄主的朋友，快快请进。\n");
		return 1;
	}
	return 0;
}

