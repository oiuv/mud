// yongdao2.c 甬道


inherit ROOM;

void create()
{
        set("short", "甬道");
        set("long", @LONG
这是一条长长的甬道，两边点着油灯，光线虽暗，却也可辨道
路，甬道依着山腹中天然洞穴修凿而成，此处开凿的豁然开朗，有很
多的江湖豪杰在此休息。
LONG );
        set("exits", ([
               "south" : __DIR__"shidong1",
               "north" : __DIR__"yongdao1",
        ]));
        set("objects", ([
               "/d/huashan/npc/haoke" : 2,
        ]));
        setup();
        replace_program(ROOM);
}
