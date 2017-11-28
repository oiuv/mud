#include <ansi.h>
inherit ROOM;

void create()
{
        set("short",  "钟楼" );
        set("long", @LONG
这是一座钟楼，中间悬有有一巨钟，上面刻的有铭文。永
乐大钟钟身足有两人那么高，看起来足有上千斤，不知道当初
是怎么挂上去的，钟的两侧悬有一巨木，看来是用来敲钟用的。 
LONG);
        
        set("exits", ([
                "down"    :__DIR__"jinrilou",
        ]));
        set("objects", ([
                "/d/hangzhou/npc/seng" : 1,
        ]));                       

        setup();
        replace_program(ROOM);       
}