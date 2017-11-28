// Room: /d/huashan/jzroad5.c

inherit ROOM;
void create()
{
        set("short", "中条山密林");
        set("long", @LONG
山路越来越小，周围茂密森林里和脚下的茅草封住了路，上不见
天光，后不见归路(road)，你简直绝望了。
LONG );
        set("exits", ([
                "northdown" : __DIR__"jzroad4",
        ]));
        set("item_desc", ([
                "road" : "路边模模糊糊，好象有个碑。可是太暗了实在看不见。\n",
        ]));
        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_use", "use");
        add_action("do_zuan", "zuan");
}

int do_use(string arg)
{
        object me;
        me = this_player();

        if( !arg || arg=="" ) return 0;
        if (!present("fire", me))  return 0;
        if( arg=="fire" ) {
             write(
"你点燃了火折，发现是一围大树，被削去树皮的树干上书“中条山”三字。
侧边一个树洞，似乎可以钻(zuan)过去。\n");
             this_player()->set_temp("marks/钻1", 1);
             return 1;
       }
}

int do_zuan(string arg)
{
        object me;
        me = this_player();

        if (me->query_temp("marks/钻1") ) {
             message("vision", me->name() + "侧身滋溜一下钻进树洞不见了。\n",
                    environment(me), ({me}) );
             me->move(__DIR__"jzroad6");
             message("vision", me->name() + "从树里钻了出来。\n",
                     environment(me), ({me}) );
             this_player()->delete_temp("marks/钻1");
             return 1;
        }
        else {
             write("你想往哪儿钻?!\n");
             return 1;
        }
}
