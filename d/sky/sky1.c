#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIW "【一重天】" NOR);
        set("long", HIW @LONG

    这里一片天际，茫茫云海，四周不见任何事物。远方一重云彩从
地面升起，架起了一座云梯(yunti)，似乎连接上层的天际…………


LONG NOR );

        set("exits", ([
                "out" : __DIR__"tianmen",
]));
        set("item_desc", ([
                "yunti" : HIW "\n一蓬白色的云彩拔地而起，连接上层的天际。\n" NOR,
]));
        set("sleep_room", 1);
        set("objects", ([
                __DIR__"npc/tie": 1,
        ]));

        setup();
}

void init()
{
        add_action("do_move", "jump");
        add_action("do_move", "move");
        add_action("do_move", "tiao");
        add_action("do_move", "enter");
        add_action("do_move", "up");
}

int do_move(string arg)
{
        object me = this_player();

        if (! arg || arg == "")
                return 0;

        if (arg == "yunti")
        {
                if ( objectp(present("tie chuanjia", environment(me))))
                {
                        write(CYN "只听铁传甲一声暴喝：“这位" +
                              RANK_D->query_respect(me) + CYN
                              "，请停步。”\n" NOR);
                        return 1;
                }
                message_vision(HIW "\n$N" HIW "顺着云梯轻轻一"
                               "纵，身体便随着气流飘了上去……\n"
                               NOR, this_player());
                me->move("/d/sky/sky2");
                return 1;
        }
        return 0;
}
