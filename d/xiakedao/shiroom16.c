// /d/xiakedao/shiroom16.c 侠客岛 石室16

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
进门便听得急促的呼吸之声。只见一人面向石壁(wall)而坐，肩
头耸动，喘息连连，似是练功到了紧要关头。另一名大汉双掌按在前
人的后心，头顶也是白气氤氲。
LONG );
        set("exits", ([
                "east"  : __DIR__"shihole4",
        ]));
        set("item_desc", ([
                "wall" : @WALL
这面墙却另有奇处，「意气素霓生」几个大字在最下面。其上刻的是
几个唐装舞女，姿态柔顺轻盈。侧面斜斜的一行注：白乐天诗：渔阳
鼙鼓动地来，惊破霓裳羽衣曲。另一行注字迹潦草：至柔而动也刚。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
