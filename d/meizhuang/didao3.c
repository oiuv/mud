// didao3.c

inherit ROOM;

void close_path();

void create()
{
        set("short", "梅庄密道");
        set("long", @LONG
这是一条昏暗潮湿的地道，地道很长，两边点着两根不太明亮的
火把，地道两旁的墙壁上画着很多不知道出自何人之手的壁画，而且
画得相当难看，你加快脚步，想知道地道的尽头是什么地方。突然之
间你发现这里的地面已经是木板(floor)拼成的了。
LONG
        );
        set("exits", ([
            "south" : __DIR__"didao2",
        ]));
        set("item_desc", ([
                "floor": "这层木板似乎可以拉开(pull)。\n",
        ]));

        setup();
}
void init()
{
        add_action("do_open", "pull");
}

int do_open(string arg)
{
        object obj;
        object me;

        if (! arg || arg == "")
        {
                write("你要打开什么？\n");
                return 1;
        }

        if (arg == "floor")
        {
                me = this_player();
                if (! query("exits/down"))
                {
                        set("exits/down", __DIR__"didao4");
                        call_out("close_path", 5);
                } else
                {
                        write("地上的木板现在已经拉开了。\n");
                        return 1;
                }

                message_vision("$N拉起地上的木板，发现下面是空的。\n", me);
                return 1;
        } else
        {
                write("你没法打开 " + arg + " 这样东西。\n");
                return 1;
        }
}

void close_path()
{
        if (! query("exits/down")) return;
        message("vision", "木板又弹了回来，遮住了下面的密道。\n",
                this_object());
        delete("exits/down");
}
