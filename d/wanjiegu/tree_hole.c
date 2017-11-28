// Room: /t/wanjiegu/tree_hole.c

inherit ROOM;

void create()
{
        set("short", "树洞");
        set("long", @LONG
树洞内非常狭窄，光线黑暗，地上铺满是枯草。洞的墙上有一
只大蜘蛛正在编织一个蜘蛛网。
LONG
        );
        set("exits", ([ /* sizeof() == 1 */
            "out" : __DIR__"entrance",
        ]));
        set("no_clean_up", 0);
        set("item_desc", ([ /* sizeof() == 2 */
            "枯草":"一堆枯草，里面有一个大铁环(ring)。\n",
            "grass":"一堆枯草，里面有一个大铁环(ring)。\n",
        ]));

        setup();
}

void init()
{
        add_action("do_pull","pull");
}

int do_pull(string arg)
{
        if( !arg ) return 0;
        if( arg != "大铁环" && arg != "ring" ) return 0;
        if( arg == "大铁环" || arg == "ring" ) {
        message_vision("$N用劲拉起大铁环，拎起一块木板，下面露出一洞。\n", this_player() );
        set("exits/enter", __DIR__"tunnel1");
        call_out("close_passage", 10);
        return 1;
        }
}

void close_passage()
{
        object room;

        if( !query("exits/enter") ) return;
        delete("exits/enter");
        message("vision","木板晃了晃，将下面的洞口盖住了。\n", this_object() );
}

