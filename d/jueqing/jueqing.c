#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "绝情峰");
        set("long", @LONG
这里便是绝情谷绝顶之处绝情峰，矗立此处俯瞰群峰，但
见群峰间云雾缭绕，轻烟缕缕。峰下千沟万壑，树木丛生，刺
骨的山风吹过，令人感到阵阵寒意。
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "southdown" : __DIR__"shanlu8",
        ]));

        set("no_clean_up", 0);
        
        setup();
        replace_program(ROOM);
}

