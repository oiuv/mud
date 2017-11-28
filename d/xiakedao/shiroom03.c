// /d/xiakedao/shiroom03.c 侠客岛 石室3

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
洞中风声劲急，数道身影正在洞中迅速异常地奔跑，直带得满
室生风。一人身法轻灵飘逸，另一人则古朴稳健，更有一人无甚特
异之处，却也十分迅捷。几人奔跑中兀自不停争论，而语气甚是平
静。旁边石壁(wall)上也是有图有字。
LONG );
        set("exits", ([
                "west"  : __DIR__"shihole1",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「银鞍照白马」几个大字。字的下方刻着一匹骏马，
昂首奔行，脚下云气弥漫，便如是在天空中飞行一般。只见一团团云
雾似乎在不断向前排涌，直如意欲破壁飞出。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
