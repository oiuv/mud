// Room: /d/hengshan/yuyang.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "玉羊游云");
        set("long", @LONG
东峰峭壁崖顶上，白石累累，散布有致，在云雾拂动下，似有
动感，象正在吃草的羊只。这就是和“金鸡报晓”齐名的恒山胜景
“玉羊游云”。
LONG);
        set("exits", ([ /* sizeof() == 4 */
           "westdown"    : __DIR__"beiyuedian",
        ]));
        set("outdoors","hengshan");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

