// /d/xiakedao/shiroom20.c 侠客岛 石室20

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
进得门来，便觉阵阵有形无质的气浪逼人，功力稍差之人似乎要
站立不稳。几位老者正在场中互较内功，身上衣衫高高蓬起。几名旁
观者均背靠石壁(wall)而立，神色紧张。
LONG );
        set("exits", ([
                "east"  : __DIR__"shihole5",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「煊赫大梁城」几个大字。下方图案极为简单，绘了
一团烈焰腾空而起，远观却又似混沌太极之形。一行注解写在图案正
中：刚不可久，柔不可守。图外亦注：《光武纪》：气佳哉！郁郁葱
葱然。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
