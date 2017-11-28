#include <ansi.h>

inherit ROOM;
string look_pubu();

void create()
{
    set("short", YEL"假山"NOR);
        set("long", @LONG
你面前矗立着一座巨大的假山，一道瀑布从假山边泻将下来，飞注入
前面的一座大池塘中，池塘底下想是另有泻水通道，是以塘水却不见满溢。
铁掌帮为建这个花园，也不知花费了多少人力和物力。
LONG    );
        set("exits", ([
                "east" : __DIR__"hhyuan-1",
        ]));

        set("item_desc", ([
//                "pubu" : (: look_pubu :),
        ]));

        set("no_clean_up", 0);
        set("outdoors", "tiezhang");

        setup();
}

string look_pubu()
{
        return @DESC
这是一股奔腾不息的瀑布，瀑布的后面似乎隐约有个小门，你似乎可以穿(cross)过去。
DESC ;
}

void init()
{
//        add_action("do_cross", "cross");
}

int do_cross(string arg)
{
        object me;
        me = this_player();

        if (arg != "瀑布" || arg != "pubu") 
                return notify_fail("你要往哪儿穿？\n");
        {
                write(HIY "你纵身一闪，向瀑布里穿去。\n" NOR);
                message("vision", HIY + me->name() + HIY "身行一闪突然不见了。\n" NOR, environment(me), ({me}) );
                me->move(__DIR__"mishi");
                message("vision", HIW + me->name() + HIW "全身湿淋淋地从瀑布里穿了进来。\n" NOR, environment(me), ({me}) );
        }
        return 1;
}
