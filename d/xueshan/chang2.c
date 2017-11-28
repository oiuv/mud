inherit ROOM;

void create()
{
        set("short", "武场");
        set("long", @LONG
这里是大轮寺的大练武场，树着好多木桩和沙袋，僧人们
日常均在此刻苦习武。往东就是广场，西边一直穿过大连武场
有个小库房。
LONG);
        set("outdoors", "xueshan");

        set("exits", ([
                "east" : __DIR__"guangchang",
                "west" : __DIR__"chang",
        ]));

        set("objects", ([
        	__DIR__"npc/x_lama" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
