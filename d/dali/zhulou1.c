inherit ROOM;

void create()
{
        set("short", "竹楼下");
        set("long", @LONG
台夷人喜居竹林深处，房舍自然少不了用竹子搭成，竹为
梁，竹为墙，竹楼建的相当精致。下层基本上只是四根柱子架
空的，既可以作兽圈，也为了防蛇。一架竹梯通向上层的房舍。
LONG);
        set("outdoors", "dali");
        set("exits", ([
                "south" : __DIR__"wuding",
                "up"    : __DIR__"zhulou2",
        ]));
        setup();
        replace_program(ROOM);
}
