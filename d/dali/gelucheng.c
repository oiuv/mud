inherit ROOM;

void create()
{
        set("short", "葛鲁城");
        set("long", @LONG
此城是乌蛮族屈部的治府，屈部领葛鲁、昌州、德昌，面
积颇大。附近多山地丛林，居民多狩猎为生，河谷内低地也多
草皮，适合放牧牛羊。东边平原上另有村镇。
LONG);
        set("objects", ([
                "/clone/quarry/yang2"  : 2,
                __DIR__"npc/muyangren" : 1,
        ]));
        set("outdoors", "dali");
        set("exits", ([
                "northup" : __DIR__"shanlin",
                "south"   : __DIR__"zhenxiong",
                "east"    : __DIR__"minadian",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
