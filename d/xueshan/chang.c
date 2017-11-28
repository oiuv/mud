inherit ROOM;

void create()
{
        set("short", "武场");
        set("long", @LONG
这里是大轮寺的大练武场，树着好多木桩和沙袋，僧人们
日常均在此刻苦习武。往东走穿过整个大练武场就是广场，西
边有个小库房，南边一大片开阔地，就是雪山闻名海内的祭坛。
LONG );
        set("outdoors", "xueshan");
        set("exits", ([
                "east" : __DIR__"chang2",
                "west" : __DIR__"kufang",
                "north" : __DIR__"chang3",
                "south" : __DIR__"jitan",
        ]));

        set("objects", ([
                __DIR__"npc/x_lama" : 1,
        ]));

        setup();

        replace_program(ROOM);
}
