inherit ROOM;

#include <ansi.h> 

void create()
{
        set("short","后园");
        set("long",@LONG 
这里是凌霄派的后园。小桥流水，菏塘低阁。层台耸翠，上
出重霄。飞阁流丹，下临无地。在这万里雪山之上，象这种温暖
如春的地方，实不多见，也难怪当年凌霄祖师要建派于此了。菏
塘中的一方假山上，一缕清泉汩汩流出，雾气蔼蔼，如梦如幻。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            "north"  : __DIR__"houyuan2",  
            "south"  : __DIR__"zhongting", 
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

