inherit ROOM;

void create()
{
        set("short", "小路");
        set("long", @LONG
这是一条小路向东南延伸，四周尽是花香鸟语，空气顿时
清新了许多。前面有一座小小的山冈。
LONG);
        set("outdoors", "wudujiao");
        set("exits", ([
                "northwest" : __DIR__"road3",
                "southup" : __DIR__"shanlu2",
        ]));
        set("objects", ([
                "/clone/quarry/tu" : 3,
        ]));

        setup();
        //replace_program(ROOM);
}
