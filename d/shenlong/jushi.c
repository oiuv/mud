#include <ansi.h>

inherit ROOM;

void create()
{
    set("short", "竹屋");
    set("long", @LONG
这里是神龙教主的居室----仙福居，中间一张大桌，墙上挂着一
副水墨画，没有什么特别出奇之处。
LONG );
    set("exits", ([
	"east" : __DIR__"zhulin",
    ]));

    set("objects",([
         CLASS_D("shenlong")+"/su": 1,
         __DIR__"npc/mujianping": 1,
         __DIR__"npc/fangyi": 1,
    ]));
    setup();
    replace_program(ROOM);
}

