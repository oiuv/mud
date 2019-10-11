#include <room.h>
#include <ansi.h>

inherit ROOM;
int do_findway(string arg);

void create()
{
	set("short", "魔神殿");
	
	set("long", @LONG
这里是传说中的魔神殿，到处都是阴森森的，墙壁两边的大火把不
知道被谁点燃了，照亮了周围的环境。地上很干糙的，东一块西一块的
散布着一根一根的不知道什么东西留下来得白森森的骨头。随着火把火
焰的跳动，你的神经被那阵阵移动的阴影吸引而绷得紧紧的，感觉四周
黑暗中潜伏的危险不由得让你握紧了手中的武器。
    你可以用(findway)寻找下一个出口。
LONG );
	
	set("outdoors", "dungeons");
	setup();
}

void init()
{
        add_action("do_findway", "findway");
}


int do_findway(string arg)
{
	string *ob1_list = ({
                "/clone/fam/gift/perwan",
                "/clone/fam/gift/kardan",
				"/clone/money/cash",
				"/clone/money/gold",
				"/clone/money/silver",
				"/clone/misc/jinchuang",
    });
        
    string *ob2_list = ({
                "/clone/fam/max/xuanhuang",
				"/clone/fam/max/longjia",
				"/clone/fam/max/tianshu1",
				"/clone/fam/max/tianshu2",
				"/clone/fam/obj/guo",
    });
	
	string gift;
    object item;
	
	object me, ob, *obs;
	int i, n, m, exp, lvl;
	me = this_player();
	obs = all_inventory(environment(me));
	obs = filter_array(obs, (: ! playerp($1) && living($1) :));
	exp = me->query("combat_exp");
	lvl = to_int(pow(to_float(exp * 10), 1.0 / 3));
	n = sizeof(obs);
		
	if (n < 1 && me->query_temp("dungeons_killed") > 8)
	{
		me->set_temp("dungeons_killed", 0);
		tell_object(me, HIY "\n迷雾终于散开,隐约有几个出口。\n" NOR);
		me->move(__DIR__"holen");
		/*set("exits", ([
		"north" : __FILE__,
		"south" : __FILE__,
		"east"  : __FILE__,
		"west"  : __FILE__,
		]));*/
		return 1;
	}
	else
	{
		tell_object(me, RED "杀！杀！杀！只有杀戮才是唯一出路。\n" NOR);
	}	
        
    if (n < 1 && me->query_temp("dungeons_killed") < 9)
	{		
		if (random(8) > 0)
		{
			m = 1;
			if (random(3) == 0) m = 2;
			for (i = 0; i < m; i++)
			{
			ob = new(CLASS_D("dungeons") + "/killer.c");
			NPC_D->set_from_me(ob, me, 100);
		
			ob->set("title", HIY "魔神护卫" NOR );
			ob->set("lvl", lvl);
			ob->add_temp("apply/dodge", lvl / 2);
			ob->add_temp("apply/parry", lvl / 2);
			ob->add_temp("apply/force", lvl / 2);
			ob->add_temp("apply/armor", lvl);
			ob->add_temp("apply/defence", lvl);
			ob->add_temp("apply/damage", lvl / 10);
			ob->add_temp("apply/unarmed_damage", lvl / 10);
			ob->move("/d/dungeons/hole1");
			}
			tell_object(me, HIW "你感觉身边好像多了个身影。\n" NOR);
		}
		else
		{
			if (random(200) > 1)
			{
				gift = ob1_list[random(sizeof(ob1_list))];
				item = new(gift);
				item->move(me);
				tell_object(me, HIW "你突然发现了一" + item->query("unit") + item->name() +
                                HIW "。\n" NOR);
			}
			else
			{
				gift = ob2_list[random(sizeof(ob2_list))];
				item = new(gift);
				item->move(me);
				tell_object(me, HIW "你突然发现了一" + item->query("unit") + item->name() +
                                HIW "。\n" NOR);
			}
		}
	}
	return 1;
}

/*
int valid_leave(object me)
{
	
	string dest;
	int total_steps = 5;
	
		
	dest = sprintf("/d/dungeons/hole%d", random(3) + 1);
	me->add_temp("dungeon/steps", random(2));
	me->move(dest);
	if (me->query_temp("dungeon/steps") == total_steps)
		{
			me->move(__DIR__"holen");
			me->delete_temp("dungeon/steps");
			write(HIY "你经过长途跋涉，终于走出了地下迷宫。\n" NOR);
		}
	return -1;
}*/
