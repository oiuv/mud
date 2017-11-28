#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "缀锦阁");
        set("long", @LONG
这是日常梳妆打扮的地方，放着一张红木梳妆台，正对着
你的是一面光润的铜镜，梳妆台上散落着一些胭脂花粉。台旁
摆着斗大的一个汝瓷花囊，插着满满的水晶球儿般的白菊。
LONG);
        set("exits", ([
                "west" : __DIR__"changl14",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
