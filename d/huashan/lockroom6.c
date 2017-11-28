#include <ansi.h>
inherit ROOM;
inherit __DIR__"tsr_room_dugu-jiujian.c";

void create()
{
        set("short", "石室");
        set("long", @LONG
这是一间宽敞的石室，只见四周空旷无比，不远处有一块
形状奇特的石桌（desk）。
LONG);
        set("exits", ([
                "out" : __DIR__"s",
        ]));
        set("room_id", "number/lockroom6");
        set("item_desc", ([
             "desk" : NOR + WHT "一张形状奇特的石桌，似乎连接着什么机关！\n" NOR,
        ]));
        set("no_clean_up", 0);
        setup();
}



