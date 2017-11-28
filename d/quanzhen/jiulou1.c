inherit ROOM;

void create()
{
        set("short", "酒楼");
        set("long", @LONG
这家酒楼是武功镇方圆百里内的唯一一家，不过连名字都
没有。楼下布置简易，顾客多是匆匆的行人，买点鸡腿、米酒
就赶路去了。楼上是雅座。
LONG);
        set("exits", ([
                "south" : __DIR__"beijie",
                "up" : __DIR__"jiulou2",
        ]));
        set("objects", ([
                __DIR__"npc/xiaoer" : 1,
        ]));

        setup();
        replace_program(ROOM);
}

