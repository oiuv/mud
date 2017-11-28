// Room: /d/mingjiao/mjleimen.c
// Jan.5 1997 By Venus

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "青石地");
    set("long", @LONG
这是一片青石地，静穆无尘。斜晖淡扫，石栏映日，辉影
雪山。三三两两高鼻深目，雪肤金发男女教众急步匆匆来去，
所配兵器也非中土能见。
LONG );
    set("exits", ([
        "southwest" : __DIR__"mjleimen1",
        "northeast" : __DIR__"mjsimen1",
    ]));
    set("outdoors", "mingjiao");
    set("no_clean_up", 0);
    setup();
    replace_program(ROOM);
}
