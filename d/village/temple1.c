// Room: /d/village/temple1.c

inherit ROOM;

void create()
{
        set("short", "玄坛庙");
	set("long", @LONG
这是一间十分破旧的小庙，庙里供的神像是赵玄坛，神像已经很残破
了，神案上也积了很多尘土，看来已有很久没人来上香进供了。大概村民
贫困的太久，已不再寄望於财神爷降福给他们了。神像後面的墙上有个半
人多高的洞(hole)。
LONG );
        set("exits", ([ /* sizeof() == 1 */
            "southwest" : __DIR__"nwroad1",
        ]));
        set("item_desc", ([
                "hole": "看来这个大洞被人凿开不久，洞那边好象有个小棚子。\n"
        ]));

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

        if (! arg || arg == "") return 0;
        if (arg == "hole")
        {
		if (me->query_temp("marks/王"))
                {
		        message("vision", me->name() + "一弯腰往洞里走了进去。\n",
			        environment(me), ({me}));
                        me->move("/d/village/temple2");
                        message("vision", me->name() + "从洞里走了进来。\n",
                                environment(me), ({me}) );
		        return 1;
		} else
                {
                        write("你没事那麽爱钻洞啊?!\n");
                        return 1;
                }
	}
}	
