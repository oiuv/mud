#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "兵器库大门");
        set("long", @LONG
你正站在荆州兵器库的门口，可以看到两个穿着制服的官
兵正在此地巡逻，不时地传来呐喊声。老百姓是不允许在此观
看的，你最好赶快走开。
LONG);
        set("exits", ([
                "east" : __DIR__"nandajie2",
        ]));
        set("objects", ([
                "/d/city/npc/bing" : 2,
        ]));

        setup();
        replace_program(ROOM);
}
