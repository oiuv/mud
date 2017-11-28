#include <room.h>
inherit ROOM;

void create()
{
        set("short", "六和塔");
        set("long", @LONG
这里是六和塔的第六层。窗(window)外是浓妆淡抹的西子湖，塔
中玲珑八角，青砖砌地，雕栏飞檐间粘连了些许蛛网。
LONG);
        set("exits", ([
            "down"  : __DIR__"liuhe5",
            "up"    : __DIR__"liuhe7",
        ]));
        set("item_desc", ([
            "window": "从窗口望出去，钱江东去。近处农田中，有一农夫正荷锄耕耘。\n",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
