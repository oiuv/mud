inherit ROOM;

void create()
{
        set("short", "草丛");
        set("long", @LONG
这里是乱草丛。北边是青竹林。其余三面都是齐腰高的蒿
草，常有蛇出没。
LONG);
        set("exits", ([
                "west"  : __FILE__,
                "north" : __DIR__"zhulin",
                "east"  : __DIR__"cao1",
                "south" : __DIR__"cao1",
        ]));

        set("objects", ([
                "/clone/beast/qingshe" : random(2),
                "/clone/beast/jinshe"  : random(2),
                "/clone/beast/dushe"   : 1,
        ]));

        set("quarrys", ([
                "caihuashe"  : 100000,
                "dushe"      : 50000,
                "jinshe"     : 40000,
                "qingshe"    : 40000,
                "yanjingshe" : 5000,
                "mangshe"    : 3000,
        ]));

        set("outdoors", "baituo");
        setup();
        replace_program(ROOM);
}
