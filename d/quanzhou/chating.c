inherit ROOM;

void create()
{
        set("short", "茶亭");
        set("long", @LONG
这是一家路边的小茶亭，赶山路的人常在此处歇歇脚。亭
子里有几张桌子和几支条凳。周围是一片树林。
LONG );
        set("exits", ([
                "west" : __DIR__"qzroad4",
        ]));
        set("objects", ([
                CLASS_D("riyue") + "/xiang" : 1,
        ]));
        set("outdoors", "quanzhou");
        setup();
        replace_program(ROOM);
}

