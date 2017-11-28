//Room: /d/dali/hongsheng1.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","塔基");
	set("long",@LONG
宏圣寺塔基座系用石板砌成，与千寻塔基为砖砌不同。基座西
面有塔门，可入内攀登而上。
LONG);
	set("exits",([ /* sizeof() == 1 */
	    "out"    : __DIR__"hongsheng",
	    "up"     : __DIR__"hongsheng2",
	]));
	set("no_clean_up", 0);
	setup();
}

/*
int valid_leave(object me, string dir)
{
	int c_skill;

	me = this_player();

	if ( me && dir == "up" )
	{
		c_skill = (int)me->query_skill("dodge", 1);
                if (me->query("qi") > 40)
                {
        		me->receive_damage("qi", 20 + random(20));
        		if (me->can_improve_skill("dodge") && c_skill < 100)
        		        me->improve_skill("dodge", 1 + c_skill / 15);
        		tell_object(me,"你爬上一层楼，有些累了。\n");
                } else
                {
                        me->set("qi", 0);
        		tell_object(me,"你实在爬不动了。\n");
                        return -1;
                }
	}
	return 1;
}
*/