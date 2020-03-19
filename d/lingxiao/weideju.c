inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","威德居");
        set("long",@LONG
这是白自在的寝室，家具屋饰，极尽豪华，谓金碧辉煌，桂
殿兰宫。但现在白自在已不知去向，只剩他的一个妾室，还在这
里抽抽噎噎地哭。
LONG);
        set("exits",([
            "south"  : __DIR__"book",   
        ]));
        set("objects", ([  
                __DIR__"npc/yaoniang" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

