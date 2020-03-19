inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","走廊");
        set("long",@LONG 
这是一条安静的走廊，北面是齐自勉的居室，南面是成自学
的房间。长老们向来除了授徒传艺，少有外出，这里一向少有人
来，只有凌霄弟子每日前来打扫。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"north"  : __DIR__"cheng",  
            	"south"  : __DIR__"qi", 
            	"southwest"  : __DIR__"houyuan2", 
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

