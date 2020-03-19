inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","走廊");
        set("long",@LONG 
这是一条安静的走廊。上下都是凌霄弟子的居所，北边是柯
万仞的居室，最近似乎忙着收徒弟。南边是凌霄城的物资室，由
张万年主管。东边是个厨房，飘来一阵阵饭菜的香味。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            "east"  : __DIR__"cook",
            "north" : __DIR__"roomke",  
            "south" : __DIR__"roomzhang", 
            "west"  : __DIR__"zhongting",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

