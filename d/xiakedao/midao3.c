// midao3.c 密道

inherit ROOM;

void create()
{
        set("short", "秘密通道");
        set("long", @LONG
这是一条很长的秘密通道，也许好久没人来过了，密道中充满了
一种潮湿的气味，隐约可以感觉到四周是冰冷的石壁，你什么也看不
见，只可以靠摸索着前进。
LONG );
        set("exits", ([
               "north" : __DIR__"midao2",
               "west" : __DIR__"midao4",
               "east" : __FILE__,
               "south" : __FILE__,
        ]));
        setup();
        replace_program(ROOM);
}
