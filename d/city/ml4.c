inherit ROOM;

void create()
{
        set("short", "青竹林");
        set("long", @LONG
这是一片茂密的青竹林，一走进来，你仿佛迷失了方向。
LONG);
        set("exits", ([
                "east" : __FILE__,
                "west" : __FILE__,
                "south" : __DIR__"dongmen",
                "north" : __DIR__"ml5",
        ]));
        set("outdoors", "city");
        setup();
        replace_program(ROOM);
}
