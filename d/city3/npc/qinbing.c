// qingbing.c

inherit NPC;

void create()
{
	set_name("亲兵", ({ "qin bing", "qin", "bing" }));
	set("gender", "男性");
	set("age", random(20) + 30);
	set("str", 25);
	set("dex", 16);
	set("long", "他手握钢刀，目视前方，真是威风凛凛。\n");
	set("combat_exp", 75000);
	set("shen_type", 1);
	set("attitude", "peaceful");

	set_skill("unarmed", 60);
	set_skill("force", 60);
	set_skill("blade", 60);
	set_skill("dodge", 60);
	set_skill("parry", 60);
	set_temp("apply/attack", 50);
	set_temp("apply/defense", 50);
	set_temp("apply/armor", 50);
	set_temp("apply/damage", 30);

	set("neili", 400); 
	set("max_neili", 400);
	set("jiali", 10);
	setup();
	carry_object("/d/city/obj/gangdao")->wield();
	add_money("silver", random(15));
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
	if( interactive(ob = this_player()) && !is_fighting() ) {
        switch(random(10))
	{   
		case 1:
		message_vision("\n亲兵忽然对$N大喝一声：何方刁民，竟敢在提督衙前此撒野！看刀！\n",this_player());
		remove_call_out("kill_ob");
		call_out("kill_ob", 1, ob);
		break;
	}
	}
}

