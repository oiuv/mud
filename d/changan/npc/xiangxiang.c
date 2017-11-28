//xiangxiang.c

inherit NPC;

int execute_ask();

void create()
{
        set_name("湘湘", ({ "xiangxiang", "xiang" }));
        set("title","萧员外之女");
	set("gender", "女性");
  	set("age", 17);
  	set("attitude", "peaceful");
  	set("shen_type", 1);
  	set("per", 40);
  	set("int", 40);
  	set("max_kee", 600);
  	set("max_gin", 600);
  	set("max_sen", 600);
  	set("force", 700);
  	set("max_force", 700);
  	set("force_factor", 50);
  	set("max_mana", 700);
  	set("mana", 700);
  	set("mana_factor", 40);
  	set("combat_exp", 250000);
  	set_skill("unarmed", 60);
  	set_skill("dodge", 60);
  	set_skill("parry", 60);
  	set_skill("force", 60);
        set("chat_chance", 15);
        set("chat_msg", ({
        	"湘湘想到伤心处，忍不住放声大哭。\n",
        	"湘湘若有所思的道：谁能给我爹捎个信叫他来救我。\n",
        }) );
        set("inquiry", ([
        	"信" : (: execute_ask() :),
        	"父亲" : (: execute_ask() :),
        	"letter" : (: execute_ask() :),
        	"家" : (: execute_ask() :),
        ]));

        setup();
   	carry_object(__DIR__"obj/skirt")->wear();
}

void greeting(object me)
{
        if (! objectp(me) || environment(me) != environment())
                return;
        command("look " + me->query("id"));
        return ;
}

void init()
{
        object ob;
        ::init();
        if (interactive(ob = this_player()) && !is_fighting()) 
	{
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
	}
        call_out ("check_rescure",1,this_player());
}

int execute_ask()
{
  	object who = this_player();
  	object me = this_object();
  	object letter = 0;

	if (who->query("combat_exp") < 30000)
	{
            	command ("shake");
            	return 1;
	}
	if (present("da shou",environment(me)))
	{
            	command ("fear");
            	return 1;
	}
	if (present("huang yi",environment(me)))
	{
            	command ("shake");
            	return 1;
	}
	if (me->query("given"))
	{
            	command ("shake");
            	return 1;
	}
  	command ("nod");
  	me->set("given",1);
  	letter = new (__DIR__"obj/letter");
  	letter->move(me);
  	command("whisper " + who->query("id") +
                " 将这封信交给我爹！叫他快来救我！");
  	command("give " + who->query("id") + " " + letter->query("id"));
  	who->save();
  	return 1;
}

int check_rescure(object who)
{
  	object me = this_object();
  	object yupei;

  	if (present("da shou",environment(me)))
            	return 1;
	if (present("huang yi",environment(me)))
            	return 1;
	yupei = present("yu pei",who);

  	if (! yupei)
            	return 1;
  	if (me->query("leader"))
            	return 1;
  	me->set("leader", who->query("id"));
  	message_vision("$N对$n急切地说道：恩人！快点儿带我去见我爹！\n",me,who);
  	command("follow " + who->query("id"));
  	me->set_temp("no_return",1);
  	return 1;
}

void unconcious()
{
  	::unconcious();
  	die();
}
