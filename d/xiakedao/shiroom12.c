// /d/xiakedao/shishi12.c 侠客岛 石室12

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
大约是刀法仅绘于此石室之故，这里层层叠叠站了不少人。刀光
霍霍，一名藏僧手持大环刀，呼喝之声不绝，与三个少年正斗得走马
灯相仿。其中绿衣的少年背靠石壁(wall)，似乎极是吃力。
LONG );
        set("exits", ([
                "east"  : __DIR__"shihole3",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「持觞劝侯嬴」几个大字。下面的图却似与诗句毫不
相干。那画中是一个手持柴刀的樵夫，臂上肌肉隆起。几十条木柴或
横或直，杂乱地散落在他面前。图的四周亦是密密的数百字小注。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
