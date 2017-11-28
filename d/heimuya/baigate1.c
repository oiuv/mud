#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "碎石小道");
        set("long", @LONG
这里是一条碎石小道，向西可到达日月神教下第二大堂白
虎堂的大门，这里不时有白虎堂的弟子走动。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
                "west" : __DIR__"baigate",
                "south" : __DIR__"baigate2",
        ]));
        setup();
        replace_program(ROOM);
}
