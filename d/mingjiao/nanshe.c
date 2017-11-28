// Room: /d/mingjiao/nanshe.c
// Jan.5 1997 by Venus

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "天门男舍");
    set("long", @LONG
走进这间男舍，一阵汗臭酒熏扑面，根本挥赶不去。几个五大
三粗汉子光脚神气赳赳，豪迈异常地喊你入席。桌上酒水淋漓，杯
盘狼籍，显然都喝得差不多了。
LONG );
    set("exits", ([
        "out" : __DIR__"mjtianmen1",
    ]));
    set("no_clean_up", 0);
    set("sleep_room", 1);
    set("no_fight", 1);
    setup();
    replace_program(ROOM);
}
