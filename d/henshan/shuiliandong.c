#include <ansi.h>
#include <room.h>
inherit ROOM;

int do_tiao(string arg);

void create()
{
        set("short", "水帘洞外");
        set("long", 
"水帘洞在紫盖峰下，紫盖峰之水经过山涧汇入紫盖仙洞之\n中，深不可测，"
"水满则溢，飞瀑(pubu)高二十余丈，数叠垂帘，\n飘泄而下，蔚为壮观。"
"明张居正诗曰「" HIW "误疑瀛海翻琼波，莫拟\n银河倒碧流，自是湘妃深隐处，"
"水晶帘挂五云头。" NOR "」以赞叹这\n衡山大四绝之一的 水帘洞之奇 。\n"
);
        set("exits", ([ 
               "westdown"    : __DIR__"shanlu12",
	       "northeast"   : __DIR__"shanlu15",	
        ]));

        set("no_clean_up", 0);

        set("outdoors", "henshan");

        set("item_desc",([
	        "pubu" : HIG "\n只见瀑布飞泻而下，气势磅礴，景致壮观，下面却"
                         "是万丈深渊，\n一望无底，水莲洞却偏偏生瀑布之后。\n\n" NOR,
	]));

        setup();
}


void init()
{
        add_action("do_tiao", ({"tiao", "jump"}));
}

int do_tiao(string arg)
{
        string msg;
        object obj, me = this_player();
        int skill_dodge;

        skill_dodge = me->query_skill("dodge", 1);

        if (! obj = find_object(__DIR__"inhole")) 
		obj = load_object(__DIR__"inhole");
            
        if (! arg || (arg != "pubu" && arg != "瀑布"))
        {	
        	write("你想往哪儿跳？\n");
        	return 1;
        }	

        if (skill_dodge < 60)
        {	
        	message_vision(HIC "\n$N" HIC "使劲向前一跃，眼见要到洞口，但$N"
                               HIC "感觉气力已尽，身在半\n空却被瀑布冲了下去。\n\n"
                               NOR, me);

         	tell_object(me, HIW "你迷迷糊糊地任湍急的水流将你冲走，身上"
                                "却是一点力气也使\n不出来。\n\n" NOR, me);

        	me->move(__DIR__"heishatan");
        	me->unconcious();     

        	return 1;
	}

        if (skill_dodge < 140)
        {
             	message_vision(HIC "\n$N" HIC "奋力往前一跳，险些被瀑布打落，但有惊"
                               "无险，$N" HIC "终于落在洞口处，可样子却甚是狼狈。\n\n" 
                               NOR, me);
        	me->move(obj);
        	message("vision", HIW "\n" + me->name() + HIW "从瀑布外跳狼狈万分地"
                                  "跳了进来。\n\n" NOR, obj, me);

        	return 1;
        }

        msg = HIC "\n$N" HIC "提气向前一纵，轻松地落在洞口处。\n\n" NOR;	
        message_vision(msg, me);
        me->move(obj);
        message("vision", HIW "\n" + me->name() + HIW "从瀑布外跳了进来。\n" NOR, 
                          obj, me);

       	return 1;
}
