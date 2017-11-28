// Room: /d/shaolin/bagua.c
// Date: YZC 96/01/19
// Date: CLEANSWORD 96/05/19

inherit ROOM;

void create()
{
	set("short", "八卦阵阵心");
	set("long", @LONG
这里就是洪荒古阵的中心。站在这里，才能看清楚四周
的情形，只见周围暮蔼沉沉，云气弥漫，不见边际。一道道
闪电如奔蛇般穿梭其间，发出阵阵闷雷。间夹着几声惨厉的
哭叫声，与雷电着地的劈裂声混合在一起，整个场面说不出
的诡异可惧。阵心正中处有一口深潭(tan)，望之深不见底。
LONG );
	set("item_desc", ([
		"tan":  "深潭边的岩石上刻着四个巨大的古篆：“万古寒潭”，\n"
			"再有五个小字：“苍松子谨书”。 潭边都是极硬的玄武岩，\n"
			"潭水澄碧透明，鱼虾不生。水面隐隐泛着一股幽幽的深绿色，\n"
			"走近便觉一股彻骨寒气扑面而来。  粗看似乎只有几十丈深，\n"
			"仔细望下去却是越看越深，直如无底深渊一般！\n",
	]));
	set("exits", ([
		"up" : __DIR__"andao3",
	]));
	set("no_clean_up", 0);
	setup();
}

void init()
{
        add_action("do_enter", "enter");
}

int do_enter(string arg)
{
	object me;
	me = this_player();

        if( !arg || arg=="" ) return 0;

        if( arg=="tan" ) 
	{
                if( present("pishui zhu", me) ) 
		{
			message_vision("$N取出辟水灵珠，含在嘴里，轻轻一纵，跃入寒潭之中。\n", me);
	                me->move("/d/shaolin/hantan1");
        	        message("vision", "只听水面哗啦一声响，似乎有人也潜下水来。\n",
                		environment(me), ({me}) );
		}
		else
		{
			tell_object(me, "你一跳入水中，只觉蚀骨寒气从全身无数个毛孔侵入，四肢几乎完全麻木，\n"
					"你拚着丹田中残余的一股内力，攀住潭边的岩石，急急忙忙地爬了出来！\n");
        	        message("vision", me->name() + "下半身一浸入水中，立刻大叫一声，落汤鸡似地跳了出来！，\n",
                		environment(me), ({me}) );
		}

		return 1;
	}
}

