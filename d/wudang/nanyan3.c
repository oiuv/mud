#include <ansi.h>
#include <room.h>

inherit ROOM;

void create()
{
        object ob1, ob2;
        set("short", "南岩迷宫");
        set("long", @LONG
你现在南岩宫地下密室中，高挂的腕粗的油烛照得满堂透
亮。但周围静谧如夜，除了烛火闪烁的风声外，你什么也听不
见。这里只有你一个人。你脚下缓缓而动，全神戒备，没有人
能帮助你。
LONG );
        set("exits", ([
                "east"      : __DIR__"nanyan1",
                "south"     : __DIR__"nanyan2",
                "west"      : __DIR__"nanyan3",
                "north"     : __DIR__"nanyan4",
                "southeast" : __DIR__"nanyan1",
                "southwest" : __DIR__"nanyan2",
                "northeast" : __DIR__"nanyan0",
                "northwest" : __DIR__"nanyan4",
        ]));
        set("objects", ([
                __DIR__"obj/table" : 1,
                "/clone/misc/corpse" : 1,
        ]) );
        setup();
        replace_program(ROOM);
}
