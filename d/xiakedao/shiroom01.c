// /d/xiakedao/shiroom01.c 侠客岛 石室1

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
这是第一间石室。不少人走来走去，已经颇为拥挤。那些人有的
注目凝思，有的打坐练功，有的闭目喃喃自语，更有的正在大声争辩。
东面是块打磨光滑的大石壁(wall)，石壁旁点燃着火把，把整间石室
照耀得白昼相仿。
LONG );
        set("exits", ([
                "south" : __DIR__"shihole1",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「赵客缦胡缨」几个大字。字的下方刻着一幅图，图
中是一个书生，他左手持扇，右手飞掌，神态甚是优雅潇洒……旁有
一行注解云：须从威猛刚硬处着手。另有无数小字，密密麻麻。
WALL
        ]));

        set("no_beg", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
