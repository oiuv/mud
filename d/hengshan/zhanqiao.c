// zhanqiao.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "悬空栈桥");
        set("long", @LONG
栈道悬于南北危楼之间，由无数的掾铺成，每节掾宽尺许，九
节并排在一起，每根掾绑在铁索上，上铺木板，长数十丈，下临深
渊。山风呼啸，惊心动魄。
LONG);
        set("exits", ([ /* sizeof() == 4 */
           "south"   : __DIR__"xuankong2",
           "north"   : __DIR__"xuankong1",
        ]));
        set("outdoors", "hengshan");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
