inherit ROOM;

void create()
{
        set("short", "密林");
        set("long", @LONG
这是一片茂密的松林，杂乱的生长在倾斜的山坡上。每棵
松树都有三四抱粗细，高达十几丈。树冠枝多叶密，将天空完
全遮住，因此林内显得有些昏暗。树木之间长着很多灌木杂草
使行走很艰难，据说人参就生长在这些杂草之中。
LONG);
        set("exits", ([
                "westdown" : __DIR__"milin1",
                "southup"  : __DIR__"milin3",
        ]));
        set("objects", ([
                "/clone/quarry/laohu2" : 1,
        ]));
        set("outdoors", "guanwai");
        setup();
        replace_program(ROOM);
}
