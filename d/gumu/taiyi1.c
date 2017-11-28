
#include <ansi.h>;
inherit ROOM;

void create()
{
        set("short", "太乙池");
        set("long", @LONG
你眼前出现一个山间湖泊，这是著名的太乙池(chi)，传
说为唐天宝年间地震造成，但见四周高峰环列，池面碧波荡漾，
山光水影，风景十分优美。
LONG);
        set("outdoors", "quanzhen");
        set("item_desc", ([
                "chi" : HIG "\n这是一个很大的山间湖，碧波荡漾，湖水清\n"
                            "澈见底，让人忍不住想跳(jump)下去畅游一番。\n" NOR,
        ]));
        set("exits", ([
                "southup"   : __DIR__"shandao3",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));

        setup();
}
void init()
{
        add_action("do_jump","jump");
}
int do_jump(string arg)
{
        object me = this_player(); 

        if( !arg || arg != "chi")
        {
                write("你往哪里跳呀? \n");
                return 1;
        }

        message_vision(HIC "\n$N "HIC "往太乙池中跳去。\n", me);
        me->move("/d/gumu/taiyi2");
        message_vision(HIW "\n$N" HIC "跳进了太乙池中来。\n", me);
        return 1;
}
