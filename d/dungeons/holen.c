
#include <room.h>
#include <ansi.h>

inherit ROOM;
int do_summons(string arg);

void create()
{
	set("short", "魔神殿第一层大殿");
	
	set("long", @LONG
这里是魔神殿的第一层，到处都是阴森森的，墙壁两边的大火把不
知道被谁点燃了，照亮了周围的环境。地上很干糙的，东一块西一块的
散布着一根一根的不知道什么东西留下来得白森森的骨头。随着火把火
焰的跳动，你的神经被那阵阵移动的阴影吸引而绷得紧紧的，感觉四周
黑暗中潜伏的危险不由得让你握紧了手中的武器。
    在这里可以召唤(kboss)小boss。
LONG );
	set("exits", ([
		//"enter"  : __FILE__,
	]));
	set("outdoors", "dungeons");
	setup();
}

void init()
{
        add_action("do_summon", "kboss");
}

int do_summon(string arg)
{

	
	object me, ob;
	int i, m, lvl, exp;
	me = this_player();
	

	exp = me->query("combat_exp");
	lvl = to_int(pow(to_float(exp * 10), 1.0 / 3));
	lvl += lvl * 0.2;
	
	if (me->query_temp("dungeons_killer1"))
		return notify_fail(RED "杀！杀！杀！只有杀戮才是唯一出路。\n" NOR);
	
    
	m = 1;
	if (random(4) == 0) m = 2;
	for (i = 0; i < m; i++)
	{
		ob = new(CLASS_D("dungeons") + "/killer1.c");
		NPC_D->set_from_me(ob, me, 100);
		
		ob->set("title", HIY "魔神殿小头目" NOR );
		ob->set("lvl", lvl);
		ob->add_temp("apply/dodge", lvl / 2);
		ob->add_temp("apply/parry", lvl / 2);
		ob->add_temp("apply/force", lvl / 2);
		ob->add_temp("apply/armor", lvl);
		ob->add_temp("apply/defence", lvl);
		ob->add_temp("apply/damage", lvl / 6);
		ob->add_temp("apply/unarmed_damage", lvl / 6);
		
		ob->move("/d/dungeons/holen");
		me->set_temp("dungeons_killer1", 1);
	}
		tell_object(me, HIW "你感觉身边好像多了个身影。\n" NOR);
		
	return 1;
}
	
	
	
