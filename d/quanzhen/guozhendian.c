#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "过真殿");
        set("long", @LONG
这是大堂旁边的一个侧殿，也是接待重要客人的地方。殿
不大，只摆放着一张桌子和几把椅子。桌上摆放着一盆青山隐
隐的盆景，墙壁上挂着一些字画。从这里往北有座小塔。
LONG);
        set("exits", ([
                "south" : __DIR__"datang3",
                "west" : __DIR__"cetang",
                "north" : __DIR__"cundaota1",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
