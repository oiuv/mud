// qiantang.c
// Date: Nov.1997 by Venus

#include <room.h>

inherit ROOM;

void create()
{
        set("short", "钱塘江畔");
        set("long", @LONG
钱塘江，每年八月十八是观潮的好日子。“八月十八潮，壮观天
下无”，乃是杭州一大奇景。西上月轮山便到了六和塔。
LONG);
        set("exits", ([
            "north"     : __DIR__"road17",
            "westup"    : __DIR__"liuheta",
        ]));
        set("objects", ([
            __DIR__"npc/jian-ke" : 1,
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
