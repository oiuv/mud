#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "小路");
        set("long", @LONG
这是一条蜿蜒的小路，北面可以远远的望见万安寺的塔间。
LONG );

        set("outdoors", "beijing");
        setup();
}
