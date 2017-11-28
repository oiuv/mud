// shuanger.c
#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
int ask_go();
int ask_kiss();

void create()
{
	set_name("双儿", ({ "shuang er", "shuang","er"}));
	set("title", HIW "天下无双" NOR);
	set("nickname", HIM "大功告成" NOR);
	set("gender", "女性");
	set("age", 15);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 15);
	set("int", 25);
	set("con", 25);
	set("dex", 30);
	
	set("max_qi", 500);
	set("max_jing", 200);
	set("neili", 500);
	set("max_neili", 500);
	set("jiali", 50);
	set("combat_exp", 50000+random(10000));
	set("score", 20000);

	set_skill("force", 80);
	set_skill("dodge", 80);
	set_skill("unarmed", 80);
	set_skill("sword", 80);
	set_skill("huashan-xinfa", 70);
	set_skill("huashan-quanfa", 70);
	set_skill("huashan-jian", 70);
	set_skill("feiyan-huixiang",80);
	map_skill("force", "huashan-xinfa");
	map_skill("dodge", "feiyan-huixiang");
	map_skill("parry", "huashan-quanfa");
	map_skill("sword", "huashan-jian");
	map_skill("unarmed", "huashan-quanfa");

	set_temp("apply/attack", 15);
	set_temp("apply/attack", 15);
	set_temp("apply/damage", 15);
	set("inquiry", ([
	     "你愿不愿意跟我走" : (: ask_go :),
	]));
	setup();
	carry_object("/clone/weapon/changjian")->wield();
	carry_object("/d/city/obj/cloth")->wear();
}


int ask_go()
{
	object me;
	string new_name,new_id,host_id;
	me=this_player();
	if(query("id")!="shuang er")
	{
		sscanf(query("id"),"%s's shuang er",host_id);
		if(query("id")==host_id)
		{
			say(query("name")+"睁大眼睛看了看"+
				me->query("name")+"，说:当然愿意啦,我都听你的。\n");
			return 1;
		}
		if(me->query("id")!=host_id)
		{
			say(query("name")+"睁大眼睛看了看"+
				me->query("name")+"，说:不行的,我得听我主人的。\n");
			return 1;
           	}
	}
	if ((int)this_player()->query("weiwang")>=70)
	{
		write( HIY "双儿道:夫人待我恩重如山,主人对我庄家又有大恩。\n" NOR);
		write( HIY "夫人要我服侍主人,我一定尽心。\n" NOR);
		command("nod");	
		set_leader(me);
		new_name = me->query("name")+"的丫环双儿";
		new_id=me->query("id")+"'s shuang er";
		set("name",new_name);
		set("id",new_id);
		set("long","这是"+new_name+"。\n"
		"她是一个十分清秀的少女,大约十四五岁年纪;\n"
		"一张雪白的脸庞,眉弯嘴小,笑靥如花,正笑嘻嘻地看着你。\n");
	}
	else say(query("name")+"睁大眼睛看着"+
		me->query("name")+"，说:不行的,夫人没有同意。\n");
	return 1;
}

