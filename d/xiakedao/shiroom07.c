// /d/xiakedao/shiroom07.c 侠客岛 石室7

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
这里亦有数人研习武功。几名女子都显得颇有心得，面色凝重地
对照着石壁(wall)练习步法，旁边的两个白衣青年却满脸迷惑，似乎
未窥门径。
LONG );
        set("exits", ([
                "west" : __DIR__"shihole2",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「事了拂衣去」几个大字。字的下方刻的是林中的一
名女子，长发披肩，背向而立。林中也有雾气环绕。旁有注云：小径
红衿，终无计留住。另一行注：拂者，柔中之力。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
