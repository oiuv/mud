#include <ansi.h>
inherit ROOM;

void create()
{ 
        set("short", "桃花迷阵");
        set("long", @LONG
这是片桃花的海洋。四周一望无际全是盛开的桃花。微风
拂过，落英缤纷。周围静悄悄的。远处偶尔传来一声鸟叫。你
心中不禁慌乱起来：还是早点出去的好。
LONG );
	set("outdoors", "taohua");
	set("exits", ([
		"east" :  __FILE__,
		"west" :  __FILE__,
		"south" : __FILE__,
		"north" : __FILE__,
	]));             
}

int valid_leave(object me, string dir)
{
        int total_steps;

        if (me->query("family/family_name") == "桃花岛"
           || me->query_skill("qimen-wuxing") >= 150)
	{
		total_steps = 1; 
        } else
	{
    		me->receive_damage("qi", 15);
    		me->receive_wound("qi", 15);
    		message_vision(HIM "\n突然间一阵桃花瓣象雨点般疾"
			       "射$N" HIM "。\n\n" NOR, me);

		total_steps = 30;
	}

	if (dir == "north")
            	me->add_temp("taohua/steps",1);

	if (dir == "south")
            	me->add_temp("taohua/steps",-1);

	if (me->query_temp("taohua/steps") == total_steps)
        {
     	    	me->move(__DIR__"tao_in");
            	me->delete_temp("taohua/steps");
            	write(HIC "\n你走了半天，终于走出了桃花迷阵。\n\n" NOR);
	   	return -1;
        }  

        if (me->query_temp("taohua/steps") == - total_steps)
        {  
		me->move(__DIR__"tao_out");
            	me->delete_temp("taohua/steps");
            	write(HIC "\n你走了半天，终于走出了桃花迷阵。\n\n" NOR);
		return -1;
     	}

        return ::valid_leave(me,dir);
}

