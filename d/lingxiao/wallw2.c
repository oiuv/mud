// wallw2.c

inherit ROOM;

void create()
{
        set("short", "城头");
        set("long", @LONG 
高处不胜寒。不只是雪，连霜也纷纷而下。头天晚上还是石
城木垛，一下子就霜雪漫天，万物俱白。古诗云‘天涯霜雪霁寒
霄’。大概也就是这个意思吧。
LONG );
        set("outdoors", "lingxiao");
        set("no_clean_up", 0);

        set("exits", ([
                "west" : __DIR__"wallw3",
                "east" : __DIR__"wallw1",
        ]));
        set("objects", ([
                __DIR__"npc/dizi" : 1,
        ])); 
        setup(); 
        replace_program(ROOM);
}

