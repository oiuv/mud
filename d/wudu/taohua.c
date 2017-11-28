#include <ansi.h> 

inherit ROOM;

void create()
{
        set("short", HIM "桃花峪" NOR);
        set("long", @LONG
你走在两山相夹的峡谷中，山上山下全是无边的野桃树，一阵山
风吹来，落英缤纷。数百年落下的桃花，桃枝都堆积在地上，人走在
上面软软的。日近正午了，远处的山林之间似乎飘荡着一股轻雾，越
来越浓。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"wdsl1",
                "northwest" : __DIR__"xiao3",
        ]));

        setup();
}

int valid_leave (object who, string dir)
{
        if (dir == "northwest")
                return ::valid_leave(who, dir);
        else
        {
                if (userp(who)
                   && (string)who->query("family/family_name") != "五毒教")
                {
                        if (! (present("xingjun san", who))
                           && who->query("max_neili") < 1000)
                        {
                                message_vision (HIM "只闻一阵浓郁的香气袭来……$N"
                                                HIM "顿时觉得头重脚轻。\n" NOR, who);
                                who->receive_damage("qi", 50);
                                remove_call_out ("fall_down");
                                call_out ("fall_down", 1, who, environment(who));
                                who->start_busy(1, 1);
                                return notify_fail(HIR "你禁不住踉跄了几下，两腿突然"
                                                   "一软。\n\n" NOR);
                        } 
                }
        	return 1;
        }
}

void fall_down (object who, object where)
{
        who->move(where);
        this_player()->unconcious();
}

void fall_down1 (object who, object where)
{
        this_player()->unconcious();
}

