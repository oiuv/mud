#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
你走在一条蜿蜒的小路上。南边翻个一个小高岗可以回到京城。
LONG );
        set("exits", ([
                "east" : __DIR__"road2",
        ]));

        set("outdoors", "beijing");
        setup();
}
void init()
{
        object me = this_player();
        message_vision(HIB "夜已经深了，翻过南边的小高岗可以由小路返回京城。\n"NOR, me);
        remove_call_out("mes");
        call_out("mes",3,this_player());
        this_player()->set_temp("want_leave",1);
        add_action("do_leave", "leave");
}

void mes(object me)
{
        message_vision(HIR "你是否愿意离开(leave)万安寺？\n"NOR, me);
}

int do_leave()
{
        object me = this_player();
        if (me->query_temp("want_leave")) 
        {
                tell_object(me, HIR "你决定离开万安寺。\n" NOR);
                me->move("/d/heimuya/road3");
        }
        return 1;
}

