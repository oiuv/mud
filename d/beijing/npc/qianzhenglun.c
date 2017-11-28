// qianzhenglun.c 钱正伦

#include <ansi.h>

inherit NPC;

int total = random(15);
mapping my_count = ([]);

void create()
{
	set_name("钱正伦", ({ "qian zhenglun","qian", "zhenglun"}));
  	set("long", "镇远镖局的镖师，常年来勤勤恳恳的打理着镖\n"
                    "局的事务，任劳任怨，忠心耿耿。他的鬓角已\n"
                    "微见白发，皮肤黝黑，身材魁梧，腰粗臂长，\n"
                    "双眼有神。\n");
	set("title", "镇远镖局镖师");
  	set("gender", "男性");
  	set("age", 45);
	set("shen_type", 1);
	set("class", "fighter");
        set("attitude", "peaceful");

  	set("str", 40);
  	set("int", 30);
	set("dex", 30);
	set("con", 35);
	set("per", 19);

	set("qi", 600);
	set("max_qi", 600);
	set("jing", 500);
	set("max_jing", 500);
	set("neili", 1500);
	set("max_neili", 1500);
	set("jiali", 75);

  	set("combat_exp", 200000);
	set("score", 50000);

  	set_skill("literate", 40);
  	set_skill("parry", 60);
  	set_skill("force", 60);
  	set_skill("dodge", 60);
  	set_skill("bagua-bu", 40);
  	set_skill("bagua-dao", 40);
	set_skill("nei-bagua", 30);
  	set_skill("blade", 60);

	map_skill("parry","bagua-dao");
	map_skill("blade","bagua-dao");
	map_skill("dodge","bagua-bu");
	map_skill("force","nei-bagua");

  	setup();

  	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
  	add_action("do_yao", "yao");
}

int do_yao(string arg)
{
  	object me = this_player(),obj;

     	if (! arg)
	{
		tell_object(me, CYN "钱正伦道：你要什么东西？\n" NOR);
		return 1;
	}

  	if ((string)me->query("family/family_name") != "八卦门")
    		return notify_fail(CYN "钱正伦道：对不起，只有镖局里"
                                   "的人才能领取兵器。\n" NOR);

	if (arg != "blade" && arg != "sword" && arg != "dagger"
           && arg != "hammer" && arg != "staff" && arg != "throwing"
           && arg != "whip" && arg != "body" && arg != "helmet"
           && arg != "feet"&& arg != "waist")
     		return notify_fail(CYN "钱正伦对你摇头道：对不起，你要的"
                                   "东西我这里没有。\n" NOR);

    	if (my_count[arg] >= total)
   		return notify_fail(CYN "钱正伦道：对不起，你要的东西我都"
                                   "已经发完了。\n" NOR); 

    	if (arg == "body" || arg == "helmet"
           || arg == "feet" || arg == "waist")
    	{
   		if (me->query_temp("mark/zhenyuan_armor") >= 3)
       			return notify_fail(CYN "钱正伦怒骂道：你要了这么"
                                           "多件护甲，还不够？\n" NOR);

   		me->add_temp("mark/zhenyuan_armor", 1);
    	} else
    	{
   		if (me->query_temp("mark/zhenyuan_weapon") >= 3)
       			return notify_fail(CYN "钱正伦怒骂道：你要了这么"
                                           "多件兵器，还不够？\n" NOR);

   		me->add_temp("mark/zhenyuan_weapon", 1);
    	}

    	my_count[arg] += 1;
    	obj = new(__DIR__"obj/" + arg);
        obj->set("no_sell", "这不是镇远镖局里的东西么？我可不敢收购。");
        obj->set("value", 50);
    	command("say 这位" + RANK_D->query_respect(me) + "，" + 
                obj->query("name") + "为数不多，千万别随便扔。");
    	message_vision(HIC "钱正伦给了$N" HIC "一" + obj->query("unit")
                       + obj->query("name")+ HIC "。\n" NOR, me);
    	obj->move(me);
    	return 1;
}