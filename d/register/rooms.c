#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", NOR + WHT "桃源瓦房" NOR);
        set("long", WHT @LONG

                    桃     源     瓦     房

    这里是桃源南侧的一间小瓦房，瓦房内布置的非常舒适，只见一个
小鬼正舒舒服服的靠在椅子上，轻摇手中羽扇，有如关羽之长，宛若诸
葛之亮。正笑吟吟的看着你进来。


LONG NOR );
        set("no_fight", 1);
        set("objects", ([
                __DIR__"npc/wei" : 1,
        ]));
        set("exits", ([
                "north"  : __DIR__"entry",
                "out"   : __DIR__"yanluodian",
        ]));

        setup();
}

int valid_leave(object me, string dir)
{
        object ob;
        if (! objectp(ob = present("wei xiaobao", this_object())))
        {
                ob = new(__DIR__"npc/wei");
                ob->move(this_object());
        }

        ob->check_leave(me, dir);
        return ::valid_leave(me, dir);
}
