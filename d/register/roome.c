#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", NOR + WHT "桃源竹屋" NOR);
        set("long", WHT @LONG

                    桃     源     竹     屋

    这里是桃源东侧的一间小竹屋，屋内清欣雅致，朴素异常。竹屋的
正堂上立着一位气宇轩昂的大汉，双目精光四射，炯炯有神。他看见你
的到来，当即拱手一笑。


LONG NOR );
        set("no_fight", 1);
        set("objects", ([
                __DIR__"npc/lu" : 1,
        ]));
        set("exits", ([
                "west"  : __DIR__"entry",
                "out"   : __DIR__"yanluodian",
        ]));

        setup();
}

int valid_leave(object me, string dir)
{
        object ob;
        if (! objectp(ob = present("lu tianshu", this_object())))
        {
                ob = new(__DIR__"npc/lu");
                ob->move(this_object());
        }

        ob->check_leave(me, dir);
        return ::valid_leave(me, dir);
}
