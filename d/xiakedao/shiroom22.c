// /d/xiakedao/shiroom22.c 侠客岛 石室22

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
只听劈啪之声不断，两个长脸汉子各持齐眉棍，正自印证武功。
一旁的两人却是默不作声，以指作棍，在空中虚点虚刺。一名少女斜
倚石壁(wall)，甚是疲倦，右侧长衫男子端着一盘点心，神色关注。
LONG );
        set("exits", ([
                "north" : __DIR__"shihole6",
                ]));
       set("item_desc", ([
                "wall" : @WALL
墙上「不惭世上英」几个大字自左上斜至右下。右上及左下各绘两幅
小图，均是手持棍棒的人形，并无故事。图侧及大字之间亦是密布小
注。一行注云：心惭混沌。又一行注：象曰：元吉在上，大有庆也。
WALL
        ]));
        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
