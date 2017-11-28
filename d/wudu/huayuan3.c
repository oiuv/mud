inherit ROOM;

void create()
{
        set("short", "花园");
        set("long", @LONG
这里是个花园，一年四季都生长着各种奇异的花草，在阳光下发
出七彩妖艳的光辉。花园里一片沉寂，竟看不到一只蜜蜂或蝴蝶飞舞。
旁边有一座小亭子。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"huating3",
                "south" : __DIR__"huayuan1",
        ]));

        setup();
        //replace_program(ROOM);
}
