#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "蜀道");
        set("long", @LONG
你走在以险著称天下的蜀道上，道路十分狭窄，这里不时
会有强盗出没，来往的人很少，举目看去，方圆几百里内没有
人烟，你还是加快步子走吧。
LONG);
        set("exits", ([
                "east" : __DIR__"shudao12",
  		"west" : __DIR__"shudao14",
        ]));
        set("objects", ([
                "/d/beijing/npc/haoke1" : 1,
        ]));
        set("no_clean_up", 0);
        set("outdoors", "chengdu");

        setup();
        replace_program(ROOM);
}

