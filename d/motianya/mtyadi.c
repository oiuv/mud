// mtyadi.c 崖底

inherit ROOM;

int do_climb(string arg);

void create()
{
        set("short", "崖底");
        set("long", @TEXT
你的面前是一座笔直的山峰，高若千丈，峰顶在云雾中隐约可见，
山峰光秃秃的，更无置手足处，山峰垂下一条铁链(lian)，仔细一看，
铁链并无锈迹，似乎有人用它爬(climb)上爬下。
TEXT );
        set("outdoors", "motianya");
        set("exits", ([
                "north" : __DIR__"mtroad",
        ]));
        setup();
}

void init()
{
        add_action("do_climb","climb");
}

int do_climb(string arg)
{
        int n;
        object me;

        if (arg != "lian")
        {
                write("你要爬什么呀? \n");
                return 1;
        }

        me = this_player();
        n = me->query_skill("dodge", 1);
        message_vision("$N深吸了一口气，慢慢沿着铁链的向上爬。\n", me);
        if (n > 80)
        {
                message_vision("$N爬了半天，终于爬了上去，$N高兴的"
                               "抹了抹汗。\n", me);
                me->move(__DIR__"mtdating");
        } else
        {
                message_vision("$N爬了一会，一不小心摔了下来。\n", me);
                me->receive_damage("qi", 50);
                me->receive_wound("qi", 50);
        }

        return 1;
}
