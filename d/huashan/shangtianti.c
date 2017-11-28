// shangtianti.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "上天梯");
        set("long", @LONG
此处绝险，必须面壁挽索，贴身探足前进，步不登高，故名"上天梯"。
北面是下山的路，往南面是金锁关。西面上去可以通达北峰云台峰。
LONG );
        set("exits", ([ /* sizeof() == 4 */
           "southup"   : __DIR__"jinsuo",
           "northdown" : __DIR__"husun",
           "westup"    : __DIR__"canglong",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "huashan");
        setup();
        replace_program(ROOM);
}

