// Room: /d/hengshan/jijiaoshi.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "鸡叫石");
        set("long", @LONG
北岳庙的西侧，有一尺许见方的石头，称鸡叫石。击之， "咯
咯" 作鸡鸣声，故名。清晨敲击，引起山谷回声，如群鸡争鸣，就
称 "金鸡报晓" 。
LONG);
        set("exits", ([ /* sizeof() == 4 */
           "east"  : __DIR__"beiyuemiao",
        ]));
        set("outdoors", "hengshan");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

