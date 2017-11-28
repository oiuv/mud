#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", NOR + WHT "桃源茅屋" NOR);
        set("long", WHT @LONG

                    桃     源     茅     屋

    这里是桃源北侧的一间小茅屋，屋内几乎没有任何陈设，简单的出
乎意料。屋内坐着一位坦胸露乳的大汉，正大碗酒、大块肉的落肚，看
见你进来，只是略略一点头。


LONG NOR );
        set("no_fight", 1);
        set("objects", ([
                __DIR__"npc/li" : 1,
        ]));
        set("exits", ([
                "south"  : __DIR__"entry",
                "out"   : __DIR__"yanluodian",
        ]));

        setup();
}

int valid_leave(object me, string dir)
{
        object ob;
        if (! objectp(ob = present("li zicheng", this_object())))
        {
                ob = new(__DIR__"npc/li");
                ob->move(this_object());
        }

        ob->check_leave(me, dir);
        return ::valid_leave(me, dir);
}
