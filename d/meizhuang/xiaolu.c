#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "蜿蜒小径");
        set("long", @LONG
这条小路的两旁种着无数的梅花，虽然还没到梅花盛开的季节，
但透过这密密的梅林，你似乎已经闻到了阵阵的梅花的幽香，这时你
已经发现你快走到庄园的门口，你暗地里加快了脚步。
LONG
        );
        set("exits", ([
            "south" : __DIR__"shijie",
            "north" : __DIR__"gate",
        ]));
        set("outdoors", "meizhuang");
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
