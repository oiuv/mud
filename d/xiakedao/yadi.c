// yadi.c 崖底

inherit ROOM;

int do_climb(string arg);
int do_swim(string arg);
int do_push(string arg);

void create()
{
        set("short", "崖底");
        set("long", @LONG
这就是悬崖谷底面了，出乎意料这是一个天然的湖泊，你现在在
湖底，四周全是水(water)，不时有几条美丽的小鱼从你身边游过，四
面并无明显出口。
LONG );
        set("item_desc",([
                "water" : "碧绿碧绿的水，在阳光照耀下美丽级了，你不禁想游泳了(swim)。\n",
        ]));
        setup();
}

void init()
{
        add_action("do_climb","climb");
        add_action("do_push","push");
        add_action("do_swim","swim");
}

int do_push(string arg)
{
        int n;
        object me;

        me = this_player();
        n = me->query("neili");
        if (! arg || arg != "men")
        {
                write("你想推什么呀? \n");
                return 1;
        }

        if (! me->query_temp("yadi_swim"))
        {
                write("你想推什么呀? \n");
                return 1;
        }

        me->delete_temp("yadi_swim");
        message_vision("$N深深吸了一口气，紧紧抓住石门的一侧。\n", me);
        if (n > 150)
        {
                message_vision("只见$N一运丹田气，双膀一使劲，石门竟缓缓的开了。\n", me);
                set("exits/west",__DIR__"shidong9");
                me->add("neili", - 150);
                remove_call_out("close");
                call_out("close", 5, this_object());
        } else
        {
                message_vision("$N使尽了全身的力，石门却纹丝没动。\n", me);
                me->set("neili", 0);
        }

        return 1;
}

void close(object room)
{
        message("vision","石门自动的合上了。\n", room);
        room->delete("exits/west");
}

int do_swim(string arg)
{
        object me;

        me = this_player();

        if (! arg || arg != "water")
        {
                write("你想做什么？在地上游泳？\n");
                return 1;
        }

        me->set_temp("yadi_swim", 1);
        message_vision("$N深吸了一口气，奋力的游了起来。\n", me);
        if (random(20) >10)
        {
                message_vision("你游着游着，突然发现了一道石门(men)，也"
                               "许你能将它推(push)开。\n", me);
                me->receive_damage("qi", 15);
                me->receive_wound("qi", 10);
        } else
        {
                message_vision("你游着游着，突然发现了一条铁索(suo)从"
                               "上面伸了过来。\n这条铁索并无铁锈，可能"
                               "经常有人爬上爬下(climb)。\n", me);
                me->receive_damage("qi", 10);
                me->receive_wound("qi", 10);
        }
        return 1;
}

int do_climb(string arg)
{
        int n;
        object me;

        if (! arg || arg != "suo")
        {
                write("你要爬什么呀? \n");
                return 1;
        }

        me = this_player();
        n = me->query_skill("dodge", 1);

        message_vision("$N深吸了一口气，慢慢沿着铁索的向上爬。\n", me);
        if (n >= 120)
        {
                message_vision("$N爬了半天，终于爬了上来，$N不禁在胸前双掌合十，感谢佛祖。\n", me);
                me->move(__DIR__"pubu");
        } else
        {
                message_vision("$N爬了一会，太累了，不小心滑了下来。唉！没办法了，认命吧！\n", me);
                me->receive_damage("qi", 15);
                me->receive_wound("qi", 10);
        }
        return 1;
}
