inherit ROOM;

void create()
{
        set("short", "牢房");
        set("long", @LONG
这里漆黑一片，你细细摸索。不久便摸到石门的缝隙，以肩
头推去，石门竟绝不摇晃，不知有多重实。一个脸色苍白的年轻
人，垂头丧气地坐在地上。
LONG );
        set("no_clean_up", 0);

        set("exits", ([
                "west" : __DIR__"laolang",
        ]));
        set("objects", ([ 
                __DIR__"npc/zhu" : 1,
        ])); 
        setup(); 
        replace_program(ROOM);
}

