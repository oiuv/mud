inherit ROOM;

void create()
{
        set("short", "水田");
        set("long", @LONG
这是一片低洼平地的农田，除了田埂，全部都被水淹没着。
一些普麽部的妇女赤着脚在田里插秧。这个地区雨水充足，虽
然没有江河流过，无需特别灌溉，每至春夏田里自然雨水溢满。
LONG);
        set("objects", ([
                __DIR__"npc/nongfu1" : 1,
        ]));
        set("outdoors", "dali");
        set("exits", ([
                "north" : __DIR__"luwang",
        ]));
        setup();
        replace_program(ROOM);
}
