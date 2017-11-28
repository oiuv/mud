// /d/xiakedao/shiroom13.c 侠客岛 石室13

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
石室正中三人席地而坐，各自闭目吐纳，隐然是天地人三才的阵
势。一个书生手持几根短竹，在地下来回摆弄，似乎正在占卜。偶尔
抬头望望石壁(wall)，若有所悟。
LONG );
        set("exits", ([
                "south" : __DIR__"shihole4",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「三杯吐然诺」几个大字。字的下方却刻的是一副淡
淡的伏羲八卦图案，颇有些文不对题。一旁有注：经曰：困于酒食，
朱绂方来，利用享祀。又有注云：老子曰：致虚极，守静笃。另有些
篆字小注，语意艰深。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
