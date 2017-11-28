#include <ansi.h>
inherit ROOM;

#define HUANGJINFU    "/clone/lonely/huangjinfu"

void create()
{
        set("short", "甬道");
        set("long", @LONG
前面山石阻路，已到尽头。只见尽头处闪闪生光，走近看
时，却是一玉石巨门。这门高达丈许，那里像门，直是一块巨
大的岩石。石门(gate)上下左右还有四个门环，均有两尺多长
的粗大铁钮紧紧扣住。
LONG);
        set("exits", ([ 
                "south" : __DIR__"yongdao2",
        ]));
        setup();
}

void init()
{
        object ob;

        ob = find_object(HUANGJINFU);
        if (! ob) ob = load_object(HUANGJINFU);

        if (! environment(ob))
	{
        	set("item_desc",([
        		"gate": WHT "\n两扇厚厚的大石门，似乎不可能打破它。只见"
                                "石门的门环上插\n着一把" NOR + YEL "黄金斧" NOR
                                + WHT "(huangjin fu)" WHT "。\n\n" NOR,

			"huangjin fu" : YEL "这是一柄纯黄铸造的大斧，斧柄末端似"
                                        "乎有些松动。\n" NOR,

			"fu"          : YEL "这是一柄纯黄铸造的大斧，斧柄末端似"
                                        "乎有些松动。\n" NOR,

			"huangjin"    : YEL "这是一柄纯黄铸造的大斧，斧柄末端似"
                                        "乎有些松动。\n" NOR,
		]));
	        add_action("do_get", "get");
     	} else
	{
        	set("item_desc",([
        		"gate": WHT "两扇厚厚的大石门，似乎不可能打破它。\n" NOR,
		]));
	}
       	add_action("do_break", "break");
}

int do_get(string arg)
{
        object me, ob;

        me = this_player();
        ob = find_object(HUANGJINFU);
        if (! ob) ob = load_object(HUANGJINFU);

        if (environment(ob)) return 0;

        if (! arg || arg == "" ) return 0;

        if (arg == "huangjin fu from gate"
           || arg == "huangjin from gate"
	   || arg == "fu from gate")
	{
	        if ((int)me->query_skill("force", 1) > 200)
		{
	                ob->move(me, 1);
                     	message_vision(HIY "\n$N" HIY "「噗」的一声，从石门上拔"
                                       "出一柄黄金斧，只激得尘土飞扬。\n\n" NOR,
                                       me);

                     	set("item_desc",([
	                     	"gate": WHT "两扇厚厚的大石门，似乎不可能打破它"
                                        "。\n" NOR,
			]));

             	} else
		{
                     	message_vision(WHT "\n$N" WHT "使出了吃奶的力，可是门环"
                                       "上的" NOR + YEL "黄金斧" NOR "(huangjin"
                                       " fu)" WHT "依然纹丝不动。\n" NOR, me);
             	}
             	return 1;
        }
        return 0;
}

int do_break(string arg)
{
        object me, ob;
        object room;

        me = this_player();
        ob = me->query_temp("weapon");

    	if (! arg || arg != "gate")
        	return notify_fail("你要毁掉什么？\n");

        if (query("exits/north"))
                return notify_fail("石门已经被劈开了，还劈什么？\n");

    	if (! ob)
	{
        	message_vision(HIY "\n$N" HIY "气沉丹田扎稳马步，大吼一声，双拳"
                               "猛的击向石门！\n" NOR, me);

    		if ((int)me->query_skill("force", 1) < 200)
		{
        		message_vision(HIR "结果只听$N" HIR "一声闷哼，被石门的"
                                       "反弹力震得飞了出去。\n\n" NOR, me);
	                me->receive_wound("qi", 300);
        		me->set("neili", 0);
        		me->unconcious();
        	} else
		{
        		message_vision(HIR "结果只听轰的一声闷响，那石门却是纹"
                                       "丝未动。\n\n" NOR, me);
        		me->set("neili", 0);
		}
        	return 1;
    	}

       	message_vision(HIY "\n$N" HIY "高高举起手中的" + ob->query("name") + HIY
                       "，朝石门猛劈而去！\n" NOR, me);

    	if ((int)me->query_skill("force", 1) < 200
           || base_name(ob) != HUANGJINFU)
	{
        	message_vision(HIR "结果只听「铛」的一声，$N" HIR "虎口一震，"
                               + ob->query("name") + HIR "禁不住脱手飞出。\n\n"
                               NOR, me);
        	ob->move(environment(me));
        	return 1;
    	}

    	if (! (room = find_object(__DIR__"yongdao4")))
        	room = load_object(__DIR__"yongdao4");

        if (! query("exits/north"))
        {
                message_vision(HIY "只听「轰」的一声巨响，石门已被$N" HIY "劈得"
                               "粉碎，露出一个洞口。\n\n" NOR, me);

                set("exits/north", __DIR__"yongdao4");
                room->set("exits/south", __FILE__);

                message("vision", HIY "\n只听外面「轰」的一声巨响，石门被人劈开"
                                  "了。\n" NOR, room);
        }
    	return 1;
}

