#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "甬道");
        set("long", @LONG
这个山洞里伸手不见五指，黑沉沉的甚么也瞧不见。
LONG);
	set("exits", ([
		"out" : __DIR__"shenfeng",
	]));
        setup();
}

void init()
{
        add_action("do_use", "use");
        add_action("do_tiao", "tiao");
        add_action("do_tiao", "jump");
}

int do_use(string arg)
{
        object me = this_player();

        if (! arg || arg == "" ) 
		return 0;

        if (! present("fire", me))
		return 0;

        if (this_object()->query("mark/light"))
                return notify_fail("你已经点着火折了。\n");

        if (arg == "fire")
	{
             	message_vision(HIR "\n$N" HIR "取出火折一晃，发现从这下去离地"
                               "面至少有十七八丈，峰内地面远比外面的为低。\n"
                               "\n" NOR, me);

        	set("long", "凭借火折的微光，你可以看到从这下去离地面至少有十"
                            "七\n八丈高，峰内地面远比外面的为低。\n");

	        add("mark/light", me->query("id"));
                return 1;
       }
}

int do_tiao(string arg)
{
        object ob, me = this_player();

        if (! this_object()->query("mark/light"))
		return notify_fail("洞里一片漆黑，你根本探不清方向。\n");

       	if (! arg || arg != "down")
		return notify_fail("你要往哪跳？\n");

        message_vision(HIY "\n$N" HIY "豫了一下，鼓气勇气，跳了下去。\n\n" NOR, me);

	// 判断是谁点燃的火折，如果持火折者跳了下去，则恢复黑暗。
	if (this_object()->query("mark/light") == me->query("id"))
	{
	        delete("mark/light");
       		set("long", "山洞里伸手不见五指，黑沉沉的甚么也瞧不见。\n");

                message("vision", HIR + me->name() + HIR "径自拿着火折跳了下去"
                        "，洞内随即又是一片漆黑。\n" NOR, environment(me), ({me}));
	}

    	if ((int)me->query_skill("dodge", 1) < 150 )
	{
        	me->move(__DIR__"shishi");
                me->receive_wound("qi", 300);
                me->unconcious();
                message("vision", HIR "\n突然听得「砰」的一声，只见一个人从上"
                                  "面的山峰上坠了下来，真是壮观。\n" NOR,
                                  environment(me), ({me}));

	        if (objectp(ob = present("fire", this_player())))
	               	destruct(ob);

        } else
	{
        	me->move(__DIR__"shishi");
        	message("vision", HIY + me->name() + HIY "从上面跳了下来。\n" NOR,
                                  environment(me), ({me}));

	        if (objectp(ob = present("fire", this_player())))
		{
                	message_vision(HIR "\n突然间$N" HIR "手一松，火折子不"
                                       "知掉到哪里去了。\n", me);
                	destruct(ob);
        	}
        }
       	return 1;
}
