#include <room.h>
inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
大道上游人，或步行，或乘轿，或骑马。个个喜气洋洋的来游西
湖。东北和西边各是一条大道。南边是上玉皇山的山路，东边则是净
慈寺。
LONG);
        set("exits", ([
            	"north" : __DIR__"road14",
            	"south" : __DIR__"yuhuangsj",
            	"west"      : __DIR__"road16",
            	"east"      : __DIR__"jingcisi",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
