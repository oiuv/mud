inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","走廊");
        set("long",@LONG 
这是一条安静的走廊。上下都是凌霄弟子的居所，北边是耿
钟的居室，听说他目前正在广收门徒。南边是汪万翼的房间。西
边是一个安静的小间，可以在那睡觉休息。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"west"  : __DIR__"sleep",
            	"north" : __DIR__"roomgeng",  
            	"south" : __DIR__"roomwang", 
            	"east"  : __DIR__"zhongting",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

