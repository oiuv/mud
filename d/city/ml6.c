inherit ROOM;

void create()
{
        set("short", "青竹林");
        set("long", @LONG
这是一片茂密的青竹林，一走进来，你仿佛迷失了方向。
LONG);
        set("exits", ([
                "east" : __FILE__,
                "west" : __DIR__"ml7",
                "south" : __DIR__"dongmen",
                "north" : __FILE__,
        ]));
        set("outdoors", "city");
        setup();
        replace_program(ROOM);
}
