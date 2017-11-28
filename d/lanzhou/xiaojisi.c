inherit ROOM;

void create()
{
        set("short", "小集市");
        set("long", @LONG
这里是兰州城的一个小集市。南边有一座老酒店，不时传
来一阵阵酒香。由于兰州是西北地区的交通要道，不论到西域
还是中原都要经过这里，所以各地的行人来来往往，你不时可
以看见一些人带着满身酒气从身边经过。
LONG);
        set("no_sleep_room",1);
        set("outdoors", "lanzhou");
        set("exits", ([
                "south"  : __DIR__"jioudian",
                "north"  : __DIR__"xidajie1",
        ]));
        set("objects", ([
                "/d/beijing/npc/dipi" : 1,
                "/d/beijing/npc/hunhun" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
