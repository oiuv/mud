#include <ansi.h> 
inherit ROOM;

void init();
int close_gate();
int do_open();
int valid_leave(object me, string dir);
string look_gate();

void create()
{
    	set("short", "广场");
    	set("long", @LONG
这里是少林寺前的广场，整个广场由大块的青石铺成，极为
平坦。但因年代久远，都有些破损。丛丛小草从石板的缝隙中长
了出来。广场的周围都是密密的松树林，四角上各放了几块石碑，
字迹都甚为模糊。正前方黄墙碧瓦，飞檐翘檩，正中一道二丈来
宽，三丈来高的朱红杉木包铜大门(gate)。上方一块大匾，龙飞
凤舞地书着『少林寺』三个大字。寺前三三两两的站着几个僧人。
LONG );
    	set("exits", ([
        	"east" : __DIR__"guangchang1e",
        	"south" : __DIR__"shijie11",
        	"west" : __DIR__"guangchang1w",
    	]));

    	set("outdoors", "shaolin");
   	set("item_desc",([
        	"gate"        :    (: look_gate :),
    	]));

    	set("objects",([
        	CLASS_D("shaolin") + "/qing-fa" : 1,
    	]));

    	setup();
    	"/clone/board/shaolin_b"->foo();
}


/* TODO
 此处改为：(knock gate) 敲门后一僧人应声打开大门：
“吱”的一声，大门打了开来，一位壮年僧人上上下下打量了你
（他，她，人名） 一会，
（如为本寺僧人，且无罪过，正神提高或无增减）侧身让开，说道：师兄辛苦了，请进。
（如为本寺僧人，正神降低或有负神）沉下脸来，说道：戒律院主持玄痛大师请师兄火
　　　　　　　　　　　　　　　　　　　　　　　　　速去戒律院陈述此行过犯。
　　　　　　　　　　　　　　　　　（直接送交戒律院处治查问后，打入僧监关押）。
（如非本寺僧人，男性，有正神）说道：这位施主请回罢，本寺不接待俗人。
（如非本寺僧人，女性，有正神）说道：这位女施主还是请回罢，本寺从不接待女客。
（如非本寺僧人，无论男女，有负神）立时从身畔挚出一把雪亮的戒刀来，把明晃晃的
　　　　　　　　　　　　　　　　　刀尖对准你的胸口，横眉怒目地说道：你等邪魔
　　　　　　　　　　　　　　　　　外道，还不给我滚开！以后再敢走近少林一步，
　　　　　　　　　　　　　　　　　我立时就斩断你们的狗腿！
对不起，俗家弟子不得入寺修行
*/

void init()
{
    	add_action("do_knock", "knock");
}

int close_gate()
{
    	object room;

    	if (! (room = find_object(__DIR__"smdian")))
        	room = load_object(__DIR__"smdian");

    	if (objectp(room))
    	{
        	delete("exits/north");
        	message("vision", HIY "只听乒地一声，里面有人把大门关上了。\n" NOR,
            			  this_object());

        	room->delete("exits/south");
        	if (objectp(present("qingfa biqiu", room)))
            		message("vision", CYN "清法比丘上前把大门关了起来。\n" NOR, room);
        	else
            		message("vision", CYN "壮年僧人上前把大门关了起来。\n" NOR, room);
    	} else
		message("vision", "ERROR: gate not found(close).\n", room);

    	return 1;
}

int do_knock(string arg)
{
    	object room;

    	if (query("exits/north"))
        	return notify_fail("大门已经是开着了。\n");

    	if (! arg || (arg != "gate" && arg != "north"))
        	return notify_fail("你要敲什么？\n");

    	if (! (room = find_object(__DIR__"smdian")))
        	room = load_object(__DIR__"smdian");

    	if (objectp(room))
    	{
        	set("exits/north", __DIR__"smdian");
        	message_vision(HIY "$N" HIY "轻轻地敲了敲门，只听吱地"
                               "一声，衣位壮年僧人应声打开大门。\n" NOR,
                               this_player());

        	room->set("exits/south", __FILE__);
        	message("vision", HIY "外面传来一阵敲门声，壮年僧人应"
                                  "声上前把大门开。\n" NOR, room);
        	remove_call_out("close_gate");
        	call_out("close_gate", 10);
    	}
    	return 1;
}

int valid_leave(object me, string dir)
{
    	if (dir != "north")
        	return ::valid_leave(me, dir);

    	if (! ::valid_leave(me, dir))
        	return 0;

    	if ((me->query("family/family_name") == "少林派"))
    	{
        	if (me->query("class") != "bonze")
        	{
            		return notify_fail(CYN "壮年僧人说道：对不起，俗家弟子不得"
                                           "入寺修行。\n" NOR);
        	}

        	if (((int)me->query("guilty") == 0) &&
	    	(me->query("combat/K_record") == me->query("combat/WPK")))
        	{
            		write(CYN "壮年僧人侧身让开，说道：师兄辛苦了，请进。\n" NOR);
            		return 1;
        	} else
        	{
            		if (me->query("guilty") == 0)
            		{
                		if (me->query("combat/shen_record") > (int)me->query("shen"))
                    			me->set("guilty", 1);
           	     		else
                    			me->set("guilty", 2);
                		me->set("combat/K_record", me->query("combat/WPK"));
                		me->set("combat/shen_record", me->query("shen"));
	        	}

            		me->move(__DIR__"smdian");
            		write(CYN "壮年僧人沉下脸来，说道：戒律院主持玄痛大师请师兄去戒律院"
                           	  "陈述此行过犯。\n" NOR);
	    		return -1;
        	}
    	} else
	if (present("yingxiong ling", me))
    	{
        	write(CYN "壮年僧人合十为礼，侧身让开，说道：原来是贵客驾到，请进请进。\n" NOR);
        	return 1;
    	}
    
    	if (me->query("shen") >= 0)
    	{
        	if (me->query("gender") == "女性")
        	{
            		return notify_fail(CYN "壮年僧人说道：这位女施主还是请回罢，本寺"
                                           "从不接待女客。\n" NOR);
        	} else
        	{
            		return notify_fail(CYN "壮年僧人说道：这位施主请回罢，本寺不接待"
                                           "俗人。\n" NOR);
        	}
    	}
    	return notify_fail(HIR "壮年僧人立时从身畔挚出一把雪亮的戒刀来，把明晃晃的刀尖对"
                           "准你的\n胸口，横眉怒目地说道：“你等邪魔外道，还不给我滚开！"
                           "以后再敢走\n近少林一步，我立时就斩断你们的狗腿！”\n\n" NOR);

}

string look_gate()
{
    	return YEL "一道三丈来高的朱红杉木包铜大门。\n" NOR;
}
