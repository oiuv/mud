// /d/xiakedao/shiroom15.c 侠客岛 石室15

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
这里酒气浓重，地上抛弃了不少酒袋或葫芦。东侧两人说话已经
含糊不清，兀自向嘴里不停倒酒，踉跄地模仿石壁(wall)上的图案。
距二人丈许外一个女子掩鼻而立，面带厌恶之色。
LONG );
        set("exits", ([
                "west"  : __DIR__"shihole4",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「眼花耳热後」几个大字。下面刻的是鲁智深醉闹山
门的故事，画中的胖和尚大醉如泥，惟妙惟肖。空中又绘着无数落叶，
随风飞舞。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
