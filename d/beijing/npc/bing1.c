inherit NPC;

void create()
{
	set_name("北京官兵", ({ "guan bing", "bing" }));
	set("age", 22);
	set("gender", "男性");
	set("long", "守卫京城和维护治安的官兵，一个个\n"
                   "体格健壮，神情严肃。\n");
	set("attitude", "peaceful");

	set("str", 25);
	set("dex", 20);
	set("combat_exp", 20000);
	set("shen_type", 1);

	set_skill("unarmed", 40);
	set_skill("dodge", 40);
	set_skill("parry", 40);
	set_skill("blade", 40);
	set_skill("force", 40);
	set_temp("apply/attack", 40);
	set_temp("apply/defense", 40);
	set_temp("apply/damage", 20);
	set_temp("apply/armor", 40);

       set("chat_chance_combat", 10);
	set("chat_msg_combat", ({
		"北京官兵喝道：大胆刁民，京城之中，竟敢造反不成？\n",
	}));
	setup();
	carry_object(__DIR__"obj/blade3")->wield();
       carry_object(__DIR__"obj/guanfu6")->wear();
}

void init()
{
	object ob;
	::init();
	if (interactive(ob = this_player()) && 
		(int)ob->query_condition("killer")) {
		remove_call_out("kill_ob");
		call_out("kill_ob", 1, ob);
	}
}

int accept_fight(object me)
{
	command("say 大爷我正想找人杀呐，今天算你倒霉。\n");
	me->apply_condition("killer", 500);
	kill_ob(me);
	return 1;
}
