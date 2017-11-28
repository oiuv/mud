//ROOM: /d/yanziwu/shuwu.c

#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "翰墨书屋");
        set("long",@LONG
屋中一架架紫竹搭成的书架倚墙而立，书架上摆满了经史
典籍。屋子正中央是一张书桌，桌上琴棋俱备，笔墨纸砚一应
俱全，墙上挂着一幅条幅(tiaofu)。大名鼎鼎的慕容公子常在
这里读书写字。
LONG );
        set("exits", ([
            "east" : __DIR__"lanyue",
            "north": __DIR__"canheju",
            "south": __DIR__"shangyu",
        ]));

        set("item_desc",([
                          "tiaofu" : HIR "
               光洒菱湖天欲晚，
               复国无计隐寒潭。
               大梦未觉身已老，
               燕语声中空笑谈。\n\n" HIG 
"你想了想始终觉得这个条幅中像是隐藏着什么秘密一样，但一时又想不出来。\n\n" NOR,
        ]));
        
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
