// zhandao.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "长空栈道");
        set("long", @LONG
栈道以铁斜插，上覆青石板，宽不足八寸。上乃绝壁，下亦绝壁。挽索
登其上，只听山风呼啸，林涛怒吼。远处偶传一两声禽鸣兽嘶，更使人毛骨
悚然。踏上悬空的栈道，紧攀铁索，屏息静气，缓步挪动，才能过去。
LONG );
        set("exits", ([ /* sizeof() == 4 */
           "southup"   : __DIR__"luoyan",
           "northdown" : __DIR__"sgyhole",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "huashan");
        setup();
        replace_program(ROOM);
}
