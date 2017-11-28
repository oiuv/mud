// Room: /d/hengshan/guolaoling.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "果老岭");
        set("long", @LONG
光滑的岩面上断续分布着行行马蹄形凹坑，坑径三四寸，深寸
许。传说这就是当年八仙中的张果老在恒山修道时，骑小毛驴由此
登天。由于路陡坡滑，他不得不牵驴步行，留下这些脚印。后人诗
云:  "盘跚云路岭头那，凹石相传果老过，想是婆心来度世，故留
遗迹使人摩。" 
LONG);
        set("exits", ([ /* sizeof() == 4 */
           "northup"   : __DIR__"beiyuemiao",
           "westdown"  : __DIR__"tongyuangu",
           "southwest" : __DIR__"hufengkou",
        ]));
        set("outdoors", "hengshan");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

