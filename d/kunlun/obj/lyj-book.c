// liangyijian-book.c

inherit ITEM;

string* titles = ({
		 "两仪剑心得",
});

void create()
{
		  set_name(titles[random(sizeof(titles))], ({ "shu", "book" }));
		  set_weight(200);
		  if( clonep() )
					 set_default_object(__FILE__);
		  else {
		  set("unit", "本");
		  set("long", "这是昆仑派前人所总结的正两仪剑法的秘籍。\n");
		  set("value", 500);
		  set("material", "paper");
		  set("skill", ([
		  "name": "liangyi-jian",     // name of the skill
		  "exp_required": 100000,      // minimum combat experience required
		  "jing_cost":    40,     // jing cost every time study this
		  "difficulty":   30,     // the base int to learn this skill
		  "max_skill":    180      // the maximum level you can learn
					 ]) );
		  }
}

void init()
{
		if(this_player()==environment() ) {
			add_action("do_study", "study");
		}
}

int do_study(string arg)
{
		object me=this_player();

		if (arg != "shu" && arg!="book" && arg != "xinde" )
			return notify_fail("你要学什么？\n");

		 if ( (int)me->query("jing")<30 )
		 return notify_fail("你太累了，还是歇会再研究吧！\n");

		if ((int)me->query_skill("liangyi-jian", 1) > 100
			&& (int)me->query_skill("liangyi-jian", 1) <= 180)
		{
                         me->receive_damage("jing", 40);
			me->improve_skill("liangyi-jian", (me->query("int", 1))/2+(me->query_skill("literate", 1))/5,1 );
			message_vision("$N苦心研究「两仪剑心得」，思索良久，似乎有所领悟。\n",me);
			return 1;
		}

         return 1;
}
