//RJQMENLOU3.C

inherit ROOM;

void create()
{
	set("short", "门楼三层");
	set("long", @LONG
这里是一间大石室，中央摆放着石桌(zhuo)石椅(chair)，石桌
上刻有纵横交错的图案，仔细看，原来是一棋局，棋盘上两黑(hei
zi)、一白(bai zi)，正该白方落子了。却不知对弈的棋士为何没有
下完。
LONG );
	set("exits", ([
		"down" : __DIR__"rjqmenlou2",
	]));
	setup();
}

void init()
{
	add_action("do_push", "push");
	add_action("do_sit", "sit");
}

int do_sit(string arg)
{

	if (arg != "chair")
		return notify_fail("你一下坐了个屁股墩。\n");	
	
	if (this_player()->query_temp("allsit") == 1)
		return notify_fail("你已经坐下了。\n");	
			
	this_player()->set_temp("allsit", 1);
	return notify_fail("你找了个空椅子座下，开始思考棋局。\n");	
}

int do_push(string arg)
{
	object me;

	me = this_player();
	if (me->query_temp("allsit") != 1)
	{
		message_vision("$N只觉得一阵恍惚，倒在了地上。\n", me);
                me->delete_temp("hei");
                me->delete_temp("allsit");		
		me->unconcious();
		return 1;
	}

	if (arg != "hei zi" && arg != "bai zi")
		return notify_fail("你轻轻按了一下石桌，真是一块好玉呀！\n");

	if (me->query_temp("allsit") && (arg == "hei zi"))
	{
		if (me->query_temp("hei")==2)
		{
			me->delete_temp("hei", 0);
			write("你轻轻按了一下黑棋子，什么反应也没有。\n");
			return 1;
		} else
		if (me->query_temp("hei")==1)
		{
			me->set_temp("hei", 2);
			write("你轻轻按了一下黑棋子，什么反应也没有。\n");
			return 1;
		} else
		if (me->query_temp("hei")==0)
		{
			me->set_temp("hei", 1);		
			write("你轻轻按了一下黑棋子，什么反应也没有。\n");
			return 1;
		}
	}

	if (me->query_temp("allsit") && (arg=="bai zi"))
	{
		if(me->query_temp("hei")!=2)
		{
			write("你轻轻按了一下白棋子，什么反应也没有。\n");	
			return 1;
		}
		if(me->query_temp("hei")==2)
		{
			message_vision("只见石椅猛的一沉，$N一声惨叫，直"
				       "跌到洞中去了。\n", me);
		        me->delete_temp("hei",0);
                        me->delete_temp("allsit",0);		
			me->move("/d/mingjiao/rjqmidao");
			return 1;			
		}
	}
}			

int valid_leave(object me, string dir)
{
    	me->delete_temp("hei",0);
    	me->delete_temp("allsit",0);
    	return ::valid_leave(me, dir);
}

