// Room: /t/wanjiegu/grassland.c

inherit ROOM;

void create()
{
        set("short", "草地");
        set("long", @LONG
这是一大片草地，前面一排松树挡住了去路。只见一株大松上
削下了丈许长、尺许宽的一片，漆着白漆，写着九个大字，“姓段
者入此谷杀无赦”。树上挂着一个铁锤。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 1 */
            "enter" : __DIR__"tunnel2",
        ]));
        set("no_clean_up", 0);

        set("item_desc", ([ /* sizeof() == 2 */
            "铁锤" : "一个铁锤，可以用来敲(knock)东西。\n",
            "hammer" : "一个铁锤，可以用来敲(knock)东西。\n",
        ]));

        setup();
}

void init()
{
        add_action("do_knock","knock");
}

int do_knock(string arg)
{
        if( !arg ) return 0;
        if( arg != "段" && arg != "duan" ) return 0;
        if( arg == "段" || arg == "duan" ) {
        message_vision("$N拿起铁锤在第二个字“段”上敲了一下。\n", this_player());
        message_vision("只听里面有人应了一声，“来了！”\n", this_player() );
        message_vision("有人从里面将门打开了。\n", this_player() );
        set("exits/north", __DIR__"xiaoting");
        call_out("close_passage", 10);
        return 1;
        }
}

void close_passage()
{
        object room;

        if( !query("exits/north") ) return;
        delete("exits/north");
        message("vision","门被人关上了。\n", this_object() );
}
