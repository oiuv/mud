// jiang 江百胜

#include <ansi.h>

inherit NPC;

void create()
{
	seteuid(getuid());

	set_name("江百胜", ({ "jiang baisheng", "jiang", "baisheng" }) );
	set("gender", "男性" );
	set("age", 30);
	set("long", "当今武林盟主魏无双之手下之亲兵队长。\n");
	set("attitude", "heroism");
	set("generation",0);
	set("winner","none");

	set("str", 25);
	set("con", 25);
	set("int", 25);
	set("dex", 25);

	set("max_qi", 400);
	set("eff_qi", 400);
	set("qi", 400);
	set("max_jing", 200);
	set("jing", 200);
	set("neili", 300);
	set("max_neili", 300);
	set("jiali", 30);
	set("shen_type", 0);

	set("no_clean_up",1);
	set("combat_exp", 50000);

	set_skill("force", 80); 
	set_skill("unarmed", 100);
	set_skill("dodge", 80);
	set_skill("parry", 80);

	set("fight_times", 0);	

	setup();
        
}

int accept_fight(object ob)
{
	object me  = this_object();
		
	me->set("eff_qi", me->query("max_qi"));
	me->set("qi",     me->query("max_qi"));
	me->set("jing",   me->query("max_jing"));
	me->set("neili",  me->query("max_neili"));

	if ( me->is_fighting()) return 0;

	if ( !present(ob, environment()) ) return 0;

	if ( me->query("fight_times") >= 10 )
		return notify_fail("江百胜已经全身脱力，趴在地上大口地喘着粗气！\n");	

	me->add("fight_times", 1);

	remove_call_out("checking");
	call_out("checking", 1, me, ob);
	
	return 1;
}

int checking(object me, object ob)
{
//	object obj;
	int my_max_qi, his_max_qi;

	if ( !present(ob, environment()) ) return 1; 

	my_max_qi  = me->query("max_qi");
	his_max_qi = ob->query("max_qi");

	if( me->is_fighting() ) 
	{
		if (( (int)me->query("qi")*100 / my_max_qi) <= 80 ) 
		{
			say(GRN "\n江百胜说道： 魏盟主泽被天下，福济苍生， 他老人家算无遗策，功无不克，克无不胜！\n" NOR);
			say(GRN "\n江百胜说道： 魏盟主一句话，属下办事戳力，勇往直前！ 冰天雪地往里闯，刀山火海就敢去！\n" NOR);
			message_vision(HIY "\n江百胜说完，全身不知打哪里冒出来的一股力气，不但功力尽复，拳力也威猛好多倍！\n" NOR, ob);

			me->set("eff_qi", me->query("max_qi"));
			me->set("qi",     me->query("max_qi"));
			me->set("jing",   me->query("max_jing"));
			me->set("neili",  me->query("max_neili"));
		}
		else if (( (int)ob->query("qi")*100 / his_max_qi) < 50 ) 
		{
			say(GRN "\n江百胜说道： 看来你小子跟我还差着一大截呢，回去练上十年再来吧！\n");
			return 1;
		}

		if ( present(ob, environment()) ) call_out("checking", 1, me, ob);
	}

	return 1;  
}