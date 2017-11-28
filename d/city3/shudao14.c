#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "蜀道");
        set("long", @LONG
你走在以险著称天下的蜀道上，道路十分狭窄，西边不远
有一座高山。要去成都的话，必须翻过这座高山。四周一片荒
凉，渺无人烟。
LONG);
        set("exits", ([
  		"westup" : __DIR__"shudao15",
  		"east" : __DIR__"shudao13",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "chengdu");

        setup();
        replace_program(ROOM);
}

