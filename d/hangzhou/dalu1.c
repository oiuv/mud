#include <room.h>
inherit ROOM;

void create()
{
        set("short", "沿湖大道");
        set("long", @LONG
路的东边是一座小山。山上郁郁葱葱，种满了树。山上本是一处
观赏西湖的好地方，但却被丁财主占为私有。大路向东北和南边延伸。
LONG);
        set("exits", ([
            	"north" : __DIR__"dadao2",
            	"south" : __DIR__"dadao3",
        ]));
        set("objects", ([
            	__DIR__"npc/tiao-fu": 1,
            	__DIR__"npc/honghua1" : 2,
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
