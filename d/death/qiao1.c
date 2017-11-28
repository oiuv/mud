#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", NOR + WHT "【奈河桥】" NOR);
        set("long", NOR + WHT @LONG

                    奈         河         桥

    这里就是著名的阴间通道「奈河桥」，在你面前矗立著一座长长的
石制拱桥，许多亡魂正哭哭啼啼地列队上桥，桥头一位白发苍苍的老妇
人，正为每一个上桥的亡魂舀着汤。


LONG NOR );
        set("exits", ([
                "north" : __DIR__"qiao2",
                "south" : __DIR__"road6",
        ]) );
        set("objects", ([
                __DIR__"npc/mengpo":1,
                __DIR__"npc/ghost":1,
        ]) );

        set("no_fight", 1);
        set("no_sleep_room", 1);

        setup();
}

int valid_leave(object me, string dir)
{
        //object ob;
        me = this_player();

        if (dir == "north")
        {
                if (! me->query_temp("last_eat/mengpo_tang")
                   && objectp(present("meng po", environment(me))) )
                        return notify_fail(CYN "孟婆说道：这位" +
                                           RANK_D->query_respect(me) +
                                           CYN "，喝碗汤再走吧。\n" NOR);
        }
        return ::valid_leave(me, dir);
}

void init()
{
        add_action("do_move", "jump");
        add_action("do_move", "tiao");
}

int do_move(string arg)
{
        //object paper,
       object me = this_player();

        if (! arg || arg == "")
                return 0;

        if (arg == "qiao" || arg == "桥" || arg == "奈河桥")
        {
                if (! me->query("hell_quest/锁阳丹")
                   && objectp(present("meng po", environment(me))))
                {
                        write(CYN "只见孟婆一把拦住你，说道：这位"
                              + RANK_D->query_respect(me) + CYN
                              "，这桥下不得，下不得！下了可就回不"
                              "来了。\n" NOR);
                        return 1;
                }
                message_vision(HIC "\n只见$N" HIC "咬了咬牙，一纵"
                               "身从奈河桥上跳了下去……\n" NOR,
                               this_player());
                me->move("/d/death/hantan1");
                message_vision(HIC "\n只听“扑通”一声，$N" HIC
                               "从上面奈河桥跳了下来。\n" NOR,
                               this_player());
                return 1;
        }
        return 0;
}
