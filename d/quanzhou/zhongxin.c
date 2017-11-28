inherit ROOM;

void create()
{
        set("short", "城中心");
        set("long", @LONG
泉州是一个安静的港城。虽然这里是城中心，人们也只是脚步轻轻地
过往，并不喧哗。东面是一个港口，从那里可以出海。西面有一条小巷。
LONG );
        set("exits", ([
                "north" : __DIR__"beimen",
                "south" : __DIR__"nanmen",
                "east"  : __DIR__"haigang",
                "west"  : __DIR__"ximen",
                "southeast" : __DIR__"majiu1",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "quanzhou");
        setup();
        replace_program(ROOM);
}
