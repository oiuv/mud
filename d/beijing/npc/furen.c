// furen.c
inherit NPC;
#include <ansi.h>

void create()
{
	set_name("庄夫人", ({ "san furen", "san","furen"}));
	set("title", "庄家三少奶奶" );
	set("nickname", HIW "未亡人" NOR);
	set("long",  "\n只见她约莫二十六七年纪,全身缟素,不施脂粉,脸色苍白.\n");
	set("gender", "女性");
	set("age", 25);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 25);
	set("int", 25);
	set("con", 25);
	set("dex", 30);
	
	set("max_qi", 1000);
	set("max_jing", 400);
	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 100);
	set("combat_exp", 100000);
	set("score", 50000);

	set_skill("force", 90);
	set_skill("dodge", 90);
	set_skill("unarmed", 90);
	set_skill("sword", 90);
	set_skill("taiji-jian", 80);
	set_skill("tiyunzong",90);
	map_skill("dodge", "tiyunzong");
	map_skill("parry", "tiaji-jian");
	map_skill("sword", "tiaji-jian");

	set_temp("apply/attack", 35);
	set_temp("apply/attack", 35);
	set_temp("apply/damage", 35);
        set("inquiry", ([
		"鳌拜"  : "鳌拜是我家的大仇人。",
		"吴之荣": "我一定要手刃了这个奸贼。",
		"礼物"  : "这样礼物可不一般，她就是我的好丫环双儿。",
		"双儿"  : "这小丫头跟随我多年，做事也还妥当。",
	]) );
	setup();
	carry_object("/clone/misc/cloth")->wear();
	carry_object("/clone/weapon/changjian")->wield();
}

void init()
{
	object ob; 
	ob = this_player();

	if( interactive(ob) && !is_fighting() ) 
	{
		remove_call_out("greeting");
		call_out("greeting", 1, ob);
	}
}

void greeting(object ob)
{
	if (! ob || environment(ob) != environment() || ! living(ob))
		return;

	say( "庄夫人说道：很久没有人来了，这位" + RANK_D->query_respect(ob) +
             "，可知道我相公的下落吗？\n");
}

int accept_object(object me, object ob)
{
	int i;

	if ( userp(ob) ) return 0; 
	if ( (string)ob->query("id") == "wu zhi rong") 
	{
		i = (int)me->query("weiwang");

		message_vision("\n庄夫人大喜道：狗贼，死去吧！"
			       "想不到你也有今天！\n", me);
		ob->move(environment());
        	ob->die();

        	if ( i >= 50 && i < 70 )
		{
			i += 10;
			me->set("weiwang", i);
			message_vision(HIC "\n$N的江湖威望提高了！\n" NOR, me);
			return -1;
		}

	 	message_vision("\n庄夫人对$N说道：这位" +
			       RANK_D->query_respect(me) +
			       "，如此大恩大德，妾身实不知何以为报。\n"
	 		       "庄夫人微一沉思，道：我想送恩公一件礼物，"
			       "务请勿却是幸。\n", me);
        } else
	if ( (string)ob->query("name") == "明史辑略" || 
	     (string)ob->query("name") == "庄允城" )
	{
	 	message_vision("\n庄夫人说道：这位" +
			       RANK_D->query_respect(me)+"，多谢了！\n", me);

	 	message_vision("庄夫人感叹道：唉！你要能帮我找到吴之荣这"
			       "狗贼就好了。\n", me);
        }		
 	return 1;
}

