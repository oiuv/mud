inherit ROOM;

#include <ansi.h> 

void create()
{
        set("short", "分天崖");
        set("long", @LONG 
这里就是凌霄城的天险—分天崖。往外望去，只见万丈深谷
上，横着一座又窄又滑的冰梯，雪花飘落，更是滑溜，在强劲的
罡风中，给人一种摇摇欲坠的感觉。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"southdown" : __DIR__"sroad6",
            	"up" : __DIR__"bingti",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}


