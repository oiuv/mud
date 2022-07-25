inherit ROOM;

void create()
{
        set("short", "花园");
        set("long", @LONG
这里是个花园，一年四季都生长着各种奇异的花草，在阳光下发
出七彩妖艳的光辉。花园里一片沉寂，竟看不到一只蜜蜂或蝴蝶飞舞。
有一条石子小路通向前面一座花厅。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"huating1",
                "south" : __DIR__"huayuan2",
                "west" : __DIR__"dating",
                "north" : __DIR__"huayuan3",
        ]));
        set("objects", ([
                 __DIR__"npc/tongzi": 4,
        ]));

        setup();
        replace_program(ROOM);
}
