inherit ROOM;

void create()
{
        set("short", "农田");
        set("long", @LONG
这是一小块普通的水田地，南诏温暖潮湿，自古以来就以
种植水稻为主。这附近是大理地区少见的平原地形，主要以耕
作为生的摆夷人开垦了一些的农田。田地划分成小块，一些摆
夷男子正在田里引着水牛耕作。有道路穿过农田向东而去。
LONG);
        set("objects", ([
                __DIR__"npc/nongfu2": 1,
        ]));
        set("outdoors", "dali");
        set("exits", ([
                "west"   : __DIR__"luojiadian",
                "east"   : __DIR__"nongtian3",
                "south"  : __DIR__"langan1",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
