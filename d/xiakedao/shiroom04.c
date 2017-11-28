// /d/xiakedao/shiroom04.c 侠客岛 石室4

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
此洞中仍是较为拥挤。有几人脚踏北斗七星方位，或正或逆地行
走；一名老者端坐于北极星位闭目打坐，头顶隐隐透出丝丝白气另有
两个黄衫女子并肩而立，在石壁(wall)上指指点点。
LONG );
        set("exits", ([
                "east" : __DIR__"shihole1"
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「飒沓如流星」几个大字。字的下方刻有一张黄道星
空图，其中北斗七星大而明显。旁有图注：虽云“流星”，然动从静
中求，毋舍本逐末也。又一行小注：春雪似锦秋风飒。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
