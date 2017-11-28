inherit ROOM;

void create()
{
        set("short","小树林");
        set("long",@LONG
这是峨嵋山金顶华藏庵外的一片小树林。林中没有路，但
地上依稀有些足迹，似乎刚有人走过。北面有一扇小窗。
LONG);
        set("outdoors", "emei");
        set("exits", ([
                "south"   : __DIR__"xiaoshulin2", 
        ]));
        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_jump", "jump");
}

int do_jump(string arg)
{
        object me = this_player();

        if (! arg || arg != "chuang")
                return 0;

        message_vision("$N趁人不注意，跳进窗里。\n", me);
        me->move(__DIR__"hcawest");
        message_vision("$N从华藏庵外跳窗进来。\n", me);
        return 1;
}
