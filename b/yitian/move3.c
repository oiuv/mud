#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "树林");
        set("long", @LONG
这是一片茂密的树林，北面就是万安寺了，到处都是亲兵，守备很是深严。
LONG );

        set("outdoors", "beijing");
        setup();
}
