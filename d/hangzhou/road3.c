#include <room.h>
inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
大道两边遍植青松，满目苍翠，偃盖如雪。被称为“九里雪松”。
东北边是洪春桥。再向西南便到了灵隐寺。南边是一条土路。
LONG);
        set("exits", ([
            "southup"     : __DIR__"huangniling",
            "west"   : __DIR__"road2",
            "northeast"   : __DIR__"hongchunqiao",
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
