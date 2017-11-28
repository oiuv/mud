inherit ROOM;

void create()
{
        set("short", "广场");
        set("long", @LONG
这里是大轮寺内的广场。广场石埕铺就，黄土垫砌，平整
而坚实。广场的北面就是依山而建的大轮寺大殿。往西是块练
武场，南面是山门。寺内有一些手持僧棍的僧兵在巡逻。
LONG);
        set("outdoors", "xueshan");
        set("exits", ([
                "east" : __DIR__"xiaoyuan",
                "west" : __DIR__"chang2",
                "north" : __DIR__"dadian",
                "south" : __DIR__"shanmen",
        ]));
        set("objects" , ([
                __DIR__"npc/seng-bing1"  : 4 ,
        ]));
        setup();
}
