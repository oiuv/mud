#include <room.h>

inherit ROOM;
void create()
{
        set("short", "渭汾流域");
        set("long", @LONG
汾河和渭河汇入黄河，增大了其水势，也带来了更多的泥
沙。这里河东是晋，河西是陕。
LONG );
        set("exits", ([
                "south" : __DIR__"huanghe1",
                "north" : __DIR__"huanghe_1",
                "southwest" : "/d/heimuya/road5",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "huanghe");
        setup();
        replace_program(ROOM);
}

