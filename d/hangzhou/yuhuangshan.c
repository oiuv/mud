#include <room.h>

inherit ROOM;

void create()
{
        set("short", "玉皇山路");
        set("long", @LONG
山脚有一座小亭，德意亭。不少游客登山前或下山後都在此小歇。
山路蜿延往东向上。西边有一条大路。
LONG);
        set("exits", ([
            "eastup"  : __DIR__"shanlu6",
            "west"    : __DIR__"road18",
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
