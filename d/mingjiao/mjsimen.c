// Room: /d/mingjiao/mjsimen.c
// Date: Java 97/05/11

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "青石道");
    set("long", @LONG
穿过一片小松林，面前出现了一条宽广的石板道，笔直通向
前方。沿道稀稀落落地种着几棵柏树，却显得高大挺拔，蝤龙般
的枝干向天空高高伸展着。
LONG );
    set("exits", ([
        "north" : __DIR__"tomen2",
        "south" : __DIR__"mjsimen1",
    ]));
    set("no_clean_up", 0);
    set("outdoors", "mingjiao");
    setup();
    replace_program(ROOM);
}

