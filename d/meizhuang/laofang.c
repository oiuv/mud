// laofang.c

inherit ROOM;

void create()
{
        set("short", "牢房");
        set("long", @LONG
这里有一张铁床，上面还依稀有一个人(man)，似乎被铁镣锁着，
躺在那里一动不动。
LONG
        );
        set("exits", ([ /* sizeof() == 2 */
            "south" : __DIR__"didao7",
        ]));

        set("item_desc", ([
                "man": "这个人如同稀泥一般，双目涣散，没有一点神采。整个人似乎只剩下
了一个干枯的躯壳，然而却还有一口气，如果不是铁镣锁着，也许可
以把他搬下床来。\n",
        ]));
        setup();
}

void init()
{
        add_action("do_move", "move");
        add_action("do_move", "ban");
}

int do_move(string arg)
{
        object me;
        object ob;

        if (arg != "man")
                return notify_fail("你要搬什么？\n");

        me = this_player();
        if (me->query_temp("get_xxbook"))
                return notify_fail("你没兴趣理这个半死不活"
                                   "的人，现在只想快点离开这里。\n");

        if (query("get_book"))
        {
                write("你走上前去，却发现锁人的铁镣上面有一个细细的缺口，而且看上
去前不久有人曾经扭开过，你不禁有些迷惑，不知道有什么机关，
索性就不再理床上那人。\n");
                return 1;
        }

        write("你仔细看了看铁镣，发现它虽然是精钢制成，却有一个细细的缺口，
这种东西也能锁住人？你不禁哑然失笑，随即把那个奄奄一息的人
搬了下来，这是你突然发现原来床上刻着一些字，你不禁有些疑惑。
于是将它抄了下来，准备慢慢研究，随即想了想，用力将上面刻的
字抹去，然后把那个人重新放到床上，不再理会。\n");
        me->set_temp("get_xxbook", 1);
        set("get_book", 1);

        ob = new("/clone/book/xx-book");
        ob->move(me, 1);

        return 1;
}
