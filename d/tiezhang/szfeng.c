#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIR "食指峰" NOR);
        set("long", @LONG
你终于爬上了峰顶，已经累得气喘吁吁了。这里只有丈许方圆的一小块
地方，寸草不生，到处都是光秃秃的岩石。一阵狂风呼啸而过，吹得你一个
趔趄，差点摔倒，看来还是赶快离开这里的好。
LONG );

        set("exits", ([
                "southdown" : __DIR__"juebi-1",
        ]));

        set("no_clean_up", 0);
        set("outdoors", "tiezhang");
        setup();
}