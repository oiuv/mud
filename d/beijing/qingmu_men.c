#include <room.h>
inherit ROOM;

void create()
{
        set("short", "青木堂大门");
        set("long", @LONG
这是一个很普通的四合院，破旧的大门敞开着，大门里是一个大院，院子
四周是几间普通的民居。
LONG );
       set("exits", ([
                "north" : __DIR__"yangliu3",
                "south" : __DIR__"qingmu_dayuan",
        ]));

        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}

