// qigai.c

inherit NPC;

void create()
{
	set_name("空空儿", ({ "qi gai","beggar","gai" }) );
	set("title", "妙手神丐");
//	set("title", "乞丐");
	set("gender", "男性" );
	set("age", 53);
	set("long", "一个满脸风霜之色的老乞丐。\n");

	set("str", 25);
	set("con", 25);
	set("dex", 25);
	set("int", 25);

	set("max_qi", 500);
	set("max_jing", 100);
	set("neili", 500);
	set("max_neili", 500);
	set("jiali", 50);
	set("shen_type", 0);

	set_temp("apply/attack",  20);
	set_temp("apply/defense", 20);
	set_temp("apply/damage",  20);

	set("combat_exp", 20000);
	set("str", 27);
	set("kar", 100);
	set("thief", 0);
	set("force", 200);

	set("max_force", 200);
	set("force_factor", 2);

	set_skill("unarmed", 50);
	set_skill("sword", 50);
	set_skill("dodge", 80);
	set_skill("parry", 80);
	set_skill("stealing", 100);
	setup();
	set("chat_chance", 15);
	set("chat_msg", ({
		"空空儿说道: 好心的大爷哪～ 赏我要饭的几个铜板吧～\n",
		"空空儿懒洋洋地打了个哈欠。\n",
		"空空儿伸手捉住了身上的虱子，骂道: 老子身上没几两肉，全叫你们给咬糜了。\n",
		(: random_move :)
	}) );
        carry_object("/clone/food/jitui");
        carry_object("/clone/food/jiudai");
	add_money("silver", 10);
}

void init()
{	
	object ob;

	::init();
	if( interactive(ob = this_player()) ) {
		remove_call_out("stealing");
		call_out("stealing", 1, ob);
	}
}

void stealing(object ob)
{
	if (! ob || environment(ob) != environment()) return;
	switch (random(5))
        {
	case 0:
               command("hehe " + ob->query("id"));
               command("steal coin from " + ob->query("id"));
               command("buy jitui");
	       break;
	case 1:
               command("grin " + ob->query("id"));
               command("steal silver from " + ob->query("id"));			
               command("eat jitui");
	       break;
	case 2:
               command("hi " + ob->query("id"));
               command("steal gold from " + ob->query("id"));			
               command("drink jiudai");
	       break;
	case 3:
               command("pat " + ob->query("id"));
               command("steal changjian from " + ob->query("id"));	
               command("wield changjian");	
               command("drink jiudai");
	       break;
	case 4:
               command("walkby " + ob->query("id"));
               command("steal jitui from " + ob->query("id"));	
               command("eat jitui");
	       break;
	}
}


int accept_object(object me, object obj)
{
	if (obj->query("money_id") && obj->value() >= 1)
        {
        	 command("smile");
	         command("say 多谢啦！其实我还是有点钱的，这次只不过试试你罢了！");
        	 command("give 10 silver to " + me->query("id"));
	} else
        {
        	 command("shake");
	         command("say 这种东西鬼才要！滚一边去！");
	         command("give " + obj->query("id") + " to " + me->query("id"));
        }

	return 1;
}

int accept_fight(object me)
{
	command("say " + RANK_D->query_respect(me) + "饶命！小的这就离开！\n");
	return 0;
}
