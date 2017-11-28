//ROOM /d/xiakedao/dating.c

inherit ROOM;

int do_push(string arg);
void create()
{
        set("short", "大厅");
        set("long", @LONG
这是『侠客岛』的大厅，四周点满了牛油蜡烛，南面放着一个大
屏风。洞内摆着一百来张桌子，宾客正络绎进来，数百名黄衣汉子穿
索般来去，引导宾客入座。
LONG );

        set("item_desc",([
                "pingfeng" : "这是一个非常漂亮的玉石屏风，不知道推(push)开它后面是什么。\n",
        ]));

        set("exits", ([
                "north" : __DIR__"shidong5",
                "east"  : __DIR__"shufang",
                "west"  : __DIR__"wuqiku",
        ]));

        set("objects",([
                __DIR__"npc/dizi" : 4,
        ]));
        setup();

        set("no_fight", 1);
        "/clone/board/xiake_b"->foo();
}

void init()
{
        add_action("do_push","push");
}

int do_push(string arg)
{
        object me = this_player();
        int n, i;

        if (! arg || arg != "pingfeng")
        {
                write("你要推什么呀。\n");
                return 1;
        }

        n = me->query("neili");
        message_vision("$N在屏风前站定，深吸一口气，两手紧握住屏风。\n", me);
        if (n >= 100)
        {
                message_vision("$N丹田一运气，猛的一推，只见屏"
                               "风之后，露出一条长长的甬道。\n", me);
                set("exits/south", __DIR__"yongdao3");
                me->deletet("neili", -100);
                remove_call_out("close");
                call_out("close", 5, this_object());
        } else
        {
                message_vision("$N丹田一运气，猛的一推，屏风却丝毫没动。\n", me);
                me->set("neili", 0);
        }
        return 1;
}

void close(object room)
{
        message("vision", "屏风自动又合上了。\n", room);
        room->delete("exits/south");
}

