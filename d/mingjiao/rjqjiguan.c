//RJQJIGUAN.C

inherit ROOM;

void create()
{
	set("short", "密道");
	set("long", @LONG
这里是一条秘道的尽头，石墙之上嵌入两盏油灯，火苗幽蓝，
向北望去，黑暗中有些光亮。
LONG );
	set("exits", ([
		"north" : __DIR__"rjqmishi",
//		"down" : __DIR__"rjqmenlou1",
	]));
//	set("outdoors", "mingjiao");
	set("no_clean_up", 0);
	setup();
//	replace_program(ROOM);
}

void init()
{
	object me;
        int q,d,eq;
        me=this_player();
        q=(int)me->query("max_qi");
        d=(int)me->query_skill("dodge");
        if(((int)me->query("mingjiao")!=1)&&(d<=100))
	{
		message_vision("$N只觉犹如利刃加身，喷血而出，浑身被射成刺猬一般\n",me);
                eq=(int)me->query("qi")-q+(int)(q*d/100);
                me->set("qi",eq);
                me->set("eff_qi",eq);
	}
        if (eq<=0) me->die();
}

