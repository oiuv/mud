// tiandihui.h for join tiandihui

#include <ansi.h>



int do_join(string arg)
{
	object me, ob/*, obj */;
	string tang;
	mapping party;

	me = this_object () ;
	ob = this_player () ;
	
	return notify_fail("天地会正在清理叛徒，不对外招人。\n");

	//return 1;

	if (! arg || arg != "tiandihui")
		return notify_fail("你要加入什么组织？\n"); 

	if ((int)ob->query("weiwang") < 20)
	{
		message_vision(HIR "$N" HIR "对$n" HIR "道：想入会？你的江湖"
			       "威望太低，天地会都是敢作敢为的好汉！\n" NOR,
			       me, ob);
		return 1;
	}

	if ((int)ob->query("shen") < 0)
	{
		message_vision(HIR "$N" HIR "对$n" HIR "大怒道：还想入会？"
			       "一看你就是个大汉奸! \n"NOR, me, ob);
		me->set_leader(this_player());
		remove_call_out("kill_ob");
		me->kill_ob(ob); 
		return 1;
	}

	if (ob->query("party") &&
	    ob->query("party/party_name") !="天地会")
	{
		message_vision("$N摇摇头，对$n说道：你已经加入其他帮"
			       "会了，不能再入我天地会。\n", me, ob);
		return 1;
	}

	if (ob->query("party/party_name") == "天地会")
	{
		message_vision("$N摇摇头，对$n说道：你已经是我"
			       "天地会的人了。\n",me,ob);
		return 1;
	}


//return notify_fail("天地会正在清理叛徒，暂停招人。\n");
	
	switch (random(10))
	{
		case 0 : tang=HIG"青木堂"; break;
		case 1 : tang=HIG"赤火堂"; break;  //古至中
		case 2 : tang=HIW"西金堂"; break;
		case 3 : tang=BLU"玄水堂"; break;
		case 4 : tang=YEL"黄土堂"; break;
		case 5 : tang=HIG"莲花堂"; break;  //蔡德忠
		case 6 : tang=HIG"洪顺堂"; break;  //方大洪
		case 7 : tang=HIW"家后堂"; break;  //马超兴
		case 8 : tang=BLU"参太堂"; break;
		default: tang=YEL"宏化堂"; break;  //李
	}
	party = allocate_mapping(5);
	party["party_name"] = "天地会";
	party["rank"] = tang + NOR"会众";
	party["level"] = 1;
	party["tasks"] = 0;
	party["enter_time"] = time();
	ob->set("party", party);

	command("smile");
	message_vision("$N对$n说道：你就暂时在" + tang + NOR +
		       "效力吧！\n", me, ob);
	if (ob->query("weiwang") < 50)
	{
		ob->set("weiwang", 50);
		message_vision(HIC "$N的江湖威望提高了！\n" NOR, this_player());
		return 1;	
	}
	return 1;
}