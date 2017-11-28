inherit ROOM;

void create()
{
        set("short", "松树林");
        set("long", @LONG
这里是一片松树林，连绵无尽，看不到尽头。四周都是参天的古
松，但许多都莫名其妙的枯死了，只剩下一些树干矗立在那里。阳光
透过枯死的树枝间隙照射到林中，暖洋洋的。四周是死一般寂静，你
不由一阵紧张。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"sl8",
                "northwest" : __DIR__"sl4",
                "west" : __DIR__"sl6",
                "northeast" : __DIR__"sl5",
                "north" : __DIR__"caodi",
        ]));

        setup();
        //replace_program(ROOM);
}
