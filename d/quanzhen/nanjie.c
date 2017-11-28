inherit ROOM;

void create()
{
        set("short", "南街");
        set("long", @LONG
这里是武功的南街，说是街，不过是一条小胡同而已。路
上一个人也没有。街的尽头有一扇小门。从这里往北，就是武
功镇的中心了。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "north" : __DIR__"zhongxin",
                "southeast" : __DIR__"fu-cemen",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
