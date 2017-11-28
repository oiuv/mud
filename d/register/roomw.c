#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", NOR + WHT "桃源石屋" NOR);
        set("long", WHT @LONG

                    桃     源     石     屋

    这里是桃源西侧的一间小石屋，看不出有什么特别。屋中立着一位
看似正气凛然的大汉，正目不转睛地盯着你看。


LONG NOR );
        set("no_fight", 1);
        set("objects", ([
                __DIR__"npc/hua" : 1,
        ]));
        set("exits", ([
                "east"  : __DIR__"entry",
                "out"   : __DIR__"yanluodian",
        ]));

        setup();
}

int valid_leave(object me, string dir)
{
        object ob;
        if (! objectp(ob = present("hua tiegan", this_object())))
        {
                ob = new(__DIR__"npc/hua");
                ob->move(this_object());
        }

        ob->check_leave(me, dir);
        return ::valid_leave(me, dir);
}
