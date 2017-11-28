// chuanfu.c 老船夫

#include <ansi.h>

inherit NPC;
void goto_matou2(object ob);

void create()
{
	set_name("老船夫", ({ "lao chuanfu","chuanfu" }));
	set("gender", "男性");
	set("age", 56);
	set("long",
		"这是一个老船夫。饱经风霜的脸上什么也看不出来。\n",
	);

	set("combat_exp", 1000000);
	set("shen_type", 1);

	set("str",800);

	set("max_neili", 100);
	set("neili", 100);
	set("jiali", 500);

	set_skill("force", 100);
	set_skill("unarmed", 300);
	set_skill("dodge", 100);
	set_skill("parry", 100);

	setup();
	carry_object("/clone/misc/cloth")->wear();
}

int accept_object(object who, object ob)
{
	int time;

	time = ob->value() / 100;
	time = 500 / time;
	if(time < 6)
		time = 6;

        if (ob->query("money_id") && ob->value() >= 2000)
	{
                message_vision("老船夫对$N说：好！这位" +
                               RANK_D->query_respect(who) + "请上船吧。\n" , who);
                who->move ("/d/city/duchuan");
                call_out("goto_matou2", time, who);
                destruct(ob);
       	        return -1;
	}
        else
                message_vision("老船夫皱眉对$N说：您给的也太少了吧？\n", who);
	return 0;
}

void goto_matou2(object ob)
{
	tell_object(ob, "渡船终于到岸了。你走下船来。\n");
	ob->move("/d/shaolin/matou2");
}

void unconcious()
{
        ::die();
}
