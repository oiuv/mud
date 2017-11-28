#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "白驼山");
        set("long", @LONG
这是传说中神秘的白驼山。远远望去，两座白沙堆积形成
的山峰好像一只骆驼的脊背。一座山门立在你的眼前。山门后
一条小路通向一座山腰上的山庄。那里是「西毒」欧阳锋的秘
宅，一般人闯进去非死即伤。
LONG);
        set("exits", ([ 
                "east" : __DIR__"shamo4",
                "westup" : __DIR__"btshan1",
        ]));
        set("objects", ([ 
                "/clone/beast/jinshe" : 3,
        ]));
        setup();
}
