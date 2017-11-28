#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", NOR + GRN "竹林" NOR);
        set("long", @LONG
北方竹子极少，这般大的一片竹林更是罕见。信步穿过竹
林，闻到一阵阵淡淡花香，登觉烦俗尽消。
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "southwest"   : __DIR__"shanlu2",
               "north"       : __DIR__"shiban",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
