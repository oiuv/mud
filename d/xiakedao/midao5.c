#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "秘密通道");
        set("long", @LONG
这是一个石室，隐约可以感觉到四周是冰冷而坚硬的石壁。
地上和角落都是灰尘，大概好久没人来过了。
LONG);
        set("exits", ([
               "east" : __DIR__"midao4",
               "out"  : __DIR__"neiting",
        ]));
        setup();
}

int valid_leave(object me,string dir)
{
        if (dir == "out")
                tell_object(me, WHT "\n你走出了秘密通道，神秘"
                                "地出现在内厅之中。\n\n" NOR);

        return ::valid_leave(me,dir);
}
