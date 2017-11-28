// midao1.c 密道


inherit ROOM;

void create()
{
        set("short", "秘密通道");
        set("long", @LONG
这是一条很长的秘密通道，也许好久没人来过了，密道中充满
了一种潮湿的气味，隐约可以感觉到四周是冰冷的石壁，你什么也
看不见，只可以靠摸索着前进。
LONG );
        set("exits", ([
               "north" : __FILE__,
               "east" : __DIR__"midao2",
               "west" : __FILE__,
               "south" : __FILE__,
        ]));
        setup();
        replace_program(ROOM);
}
