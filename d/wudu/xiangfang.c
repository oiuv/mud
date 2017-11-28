#include <ansi.h> 
inherit ROOM;

void create()
{
        set("short", "厢房");
        set("long", @LONG
这是一间乱糟糟的厢房，里面到处都是各种大大小小的笼子、瓦
罐之类的东西。不时还能看到有毒虫在笼子里面上窜下跳，四处游走。
一个赤着膀子的白胡子老者正在手忙脚乱的给毒虫们挨个喂食，忙得
手忙脚乱。
LONG);
        set("exits", ([
                "east" : __DIR__"nanyuan",
        ]));
        set("objects", ([
                __DIR__"npc/oldman": 1,
        ]));
        setup();
}
