#include <room.h>
inherit ROOM;

void create()
{
        set("short", "储藏室");
        set("long", @LONG
这里是个储藏室，四周密不透风，只有一扇关闭着的大门。
LONG);
        set("exits", ([
                "west" : __DIR__"yuanzi",
        ]));
        create_door("west", "木门", "east", DOOR_CLOSED);
        setup();
        replace_program(ROOM);
}
