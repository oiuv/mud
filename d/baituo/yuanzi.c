#include <room.h>
inherit ROOM;

void create()
{
        set("short", "院子");
        set("long", @LONG
这是一个大院子，打扫得一尘不染。四周装点着几株青青
翠竹，错落有致。西边是武器库。东边有一间储藏室，房门关
闭着。北边是白驼山庄的大厅。南边就是大门了。
LONG);
        set("exits", ([
                "northup" : __DIR__"dating",
                "west"    : __DIR__"wuqiku",
                "east"    : __DIR__"storeroom",
                "south"   : __DIR__"damen",
        ]));
        create_door("east", "木门", "west", DOOR_CLOSED);
        setup();
        replace_program(ROOM);
}
