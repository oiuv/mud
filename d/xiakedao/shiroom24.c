// /d/xiakedao/shishi24.c 侠客岛 石室24

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
这里火光昏暗，只见那龙岛主与木岛主盘膝坐在锦垫之上，面对
石壁(wall)，凝神苦思。此石室已是山腹最深处，却宽阔高大，足可
容下近百人。洞中火把亦是其他洞的二三倍之多。
LONG );
        set("exits", ([
                "east" : __DIR__"shihole6",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「白首太玄经」几个大字。字的下方刻的是密密麻麻
的蝌蚪文，成千上万。文字排列甚不整齐，或横或竖，或直或斜。左
下的大片甚至混成一团难分次序，委实难以辨认。
WALL
        ]));
        set("objects", ([
                CLASS_D("xiakedao") + "/long" : 1,
                CLASS_D("xiakedao") + "/mu"   : 1,
        ]));
        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
