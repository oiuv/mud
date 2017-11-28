inherit ROOM;

void create()
{
        set("short", "石板路");
        set("long", @LONG
你走在一条石板路上，一直通向后院，路两旁是些普通的
花草，树上的小鸟，不停的叫着。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "north" : __DIR__"guofu_houyuan",
               "south" : __DIR__"guofu_shilu-4",
        ]));
        set("objects", ([
           	__DIR__"npc/puren1" : 1,
        ]));
        set("outdoors", "wuguan");
        setup();
        replace_program(ROOM);
}
