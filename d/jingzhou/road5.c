#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "青山");
        set("long", @LONG
山中树木茂密，花开万朵，倾耳细听，可以听见山溪流水
的声音，风吹树页的声音，如同一首大自然的乐曲，美妙动听。
LONG);
        set("exits", ([
  		"northeast" : __DIR__"qingshan1",
  		"west" : __DIR__"road6",
	]));
        set("no_clean_up", 0);
        set("outdoors", "jingzhou");
        setup();
        replace_program(ROOM);
}

