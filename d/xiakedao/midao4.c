// midao4.c 密道

inherit ROOM;

int do_break(string arg);

void create()
{
        set("short", "密道");
        set("long", @LONG
这是一条很长的秘密通道，四周是坚硬的石壁，你什么也看不见，
只能摸索前进。突然你走到了路的尽头，这是个死路，你还是回去吧。
LONG );
        set("item_desc",([
            "shibi" : "石壁有什么可看的，不过这侧的石壁和其他的不同却是真的。
呀，它是一个石门(men)！\n",
        ]));
        set("exits", ([
                "east" : __DIR__"midao3",
        ]));
        setup();

}

void init()
{
        add_action("do_break", "break");
}

int do_break(string arg)
{
        int n;
        object me;

        me = this_player();
        n = me->query("neili");
        if (arg != "men")
        {
                write("不要随意打破别人的东西。\n");
                return 1;
        }

        message_vision("$N在石门前站定，深吸一口气，两掌同时拍出。\n", me);
        if (n > 200)
        {
                message_vision("$N丹田一运气，猛的一拍，石门慢慢的开了。\n", me);
                set("exits/west", __DIR__"midao5");
                me->add("neili", -200);
                remove_call_out("close");
                call_out("close", 5, this_object());
        } else
        {
            message_vision("$N丹田一运气，猛的一拍，石门却丝毫没动。\n", me);
            me->set("neili", 0);
        }
        return 1;
}

void close(object room)
{
        message("vision","石门自动的合上了。\n", room);
        room->delete("exits/west");
}
