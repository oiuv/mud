// Room: /d/mingjiao/sushe.c
// Jan.5 1997 by Venus

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "雷门宿舍");
    set("long", @LONG
走进这间宿舍，满目异国情调。雷门教众似乎不大理睬你。许是
言语不通，你也不想在此多留。
LONG );
    set("exits", ([
        "out" : __DIR__"mjleimen1",
    ]));
    set("no_clean_up", 0);
    set("sleep_room", 1);
    set("no_fight", 1);
    setup();
    replace_program(ROOM);
}
