// Room: /t/wanjiegu/entrance.c

inherit ROOM;

void create()
{
        set("short", "大森林");
        set("long", @LONG
这里是好大一座森林，黑压压的一片望不到边。最特别是左首
一排并列着九株参天大松树，每颗树都高耸入云。树下草丛茂密，
挡住了去路。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 1 */
            "east" : __DIR__"shan_road4",
        ]));
        set("no_clean_up", 0);

        set("item_desc", ([ /* sizeof() == 2 */
            "草丛" : "一片茂密的草丛，你可以试着把它拨开(pushaside)。\n",
            "grass" : "一片茂密的草丛，你可以试着把它拨开(pushaside)。\n",
        ]));

        setup();
}

void init()
{
        add_action("do_push","pushaside");
}

int do_push(string arg)
{
        if( !arg ) return 0;
        if( arg != "草丛" && arg != "grass" ) return 0;
        if( arg == "草丛" || arg == "grass" ) {
            message_vision("$N拨开长草，树上出现一洞。\n", this_player() );
            set("exits/enter", __DIR__"tree_hole");
            call_out("close_passage", 10);
            return 1;
        }
}

void close_passage()
{
//      object room;

        if( !query("exits/enter") ) return;
        delete("exits/enter");
        message("vision","一阵风吹来，长草将树洞盖住了。\n", this_object() );
}
