inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","走廊");
        set("long",@LONG 
这是一条安静的走廊，少有闲人走动，凌霄城四位五代长老
就居住在此周围。四老不喜花雪，是以深居此处。但听说由于六
代弟子中白万剑最为出色，甚至隐隐有压倒四位长老之势。四老
心中不喜，已不收弟子。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"north"  : __DIR__"liao",  
            	"south"  : __DIR__"liang", 
            	"southeast"  : __DIR__"houyuan2", 
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

