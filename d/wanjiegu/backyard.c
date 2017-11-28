// Room: /t/wanjiegu/backyard.c

#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "后院");
        set("long", @LONG
后院是一大片开阔的草地，绿草如荫，几朵野花点缀其间，草
地中间放着一块大石刻成的棋盘，一个黄眉老僧和一个青袍客正在
下棋。北边有一间石屋，门口被一块大石头(rock)挡住了。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([
            "south" : __DIR__"hall",
        ]));
        set("objects", ([
            __DIR__"npc/monk" : 1,
            CLASS_D("duan") + "/duanyq" : 1,
        ]));
        set("item_desc", ([
            "rock"   : "一块很大的石头，挡住了石屋的入口。\n",
        ]));

        setup();
}

void init()
{
        add_action("do_push","push");
}

void check_trigger()
{
        object room;
        if ((int)query("trigger") == 9 &&
            !query("exits/north"))
        {
                message("vision", HIW "大石终于被推开了，露出通向石屋的通道。\n" NOR,
                        this_object());
                set("exits/north", __DIR__"stone_room");
                delete("trigger");
        }
}

int do_push(string arg)
{
        string dir;
        object me = this_player();

        if (me->is_busy())
        {
             message_vision("你的上一个动作还没有完成！\n", me);
             return 1;
        }

        if (!arg || arg=="")
        {
             write("你要干什么？\n");
             return 1;
        }

        if (arg == "rock")
        {
                if ( me->query_str() < 25 )
                {
                        tell_object(me,"你的力气太小了，用点内力试试看！\n");
                        return 1;
                }
                me->start_busy(2);
                message_vision(HIW "$N气运丹田，发内力推动大石头。\n" NOR,me);
                call_out("pushstone", 2, me);
                me->stop_busy();
                check_trigger();
                return 1;
        }
}

int pushstone(object me)
{
        if (me->query("neili") >= me->query("neili_factor"))
        {
                message_vision(HIW "大石头动了一下。\n" NOR, me);
                me->add("neili", -me->query("neili_factor"));
                add("trigger", 1);
                return 1;
        } else
        {
                tell_object(me, "你的内力不够了，休息一会再推吧！\n");
                return 1;
        }
}

void reset()
{
        ::reset();
        delete("trigger");
        delete("exits/north");
}
