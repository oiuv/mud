//Room: /d/dali/hongsheng2.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","宏圣寺塔");
	set("long",@LONG
这里是宏圣寺塔内部，四面墙壁上都辟有佛龛，龛内置佛像。
抬头上望，可以看到中心柱、葫芦顶、伞盖、相轮及莲花座托等。
伞盖成八角形，角上挂有风铎。
LONG);
	set("exits",([ /* sizeof() == 1 */
	    "down"   : __DIR__"hongsheng1",
	    "up"     : __DIR__"hongsheng3",
	]));
	setup();
}

/*
int valid_leave(object me, string dir)
{
	int c_skill;

	me = this_player();

	if (dir == "up" )
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
        		tell_object(me,"你实在是爬不动了。\n");
                        return -1;
                }
	}
	return 1;
}
*/