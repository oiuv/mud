inherit ROOM;

void create()
{
        set("short", "练功场");
        set("long", @LONG
这里是白驼山弟子的练功场。东边是一个练功房。北边是
个门廊，西边连着一条长廊，雕梁画柱，非常气派。南面可见
巍巍大厅。
LONG);
        set("outdoors", "baituo");
        set("exits", ([
                "east"  : __DIR__"fang",
                "north" : __DIR__"menlang",
                "west"  : __DIR__"changlang",
                "south" : __DIR__"dating",
        ]));
        set("objects", ([
                __DIR__"npc/li" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
