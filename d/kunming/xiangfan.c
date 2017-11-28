#include <ansi.h>
inherit ROOM;

void create()
{
        set("short",  "厢房" );
        set("long", @LONG
一间不大的厢房，收拾的十分干净，看来是家人平是起居
之用，一扇小窗户透进些光线了，显的十分的舒心。
LONG);
        set("no_fight", 1);
        set("sleep_room", 1);
        set("exits", ([
                "west"   :__DIR__"dongzoulang1",
        ]));
        set("objects", ([
                "/d/shaolin/npc/shang1" : 2,
        ]));
        setup();
        replace_program(ROOM);         
}
