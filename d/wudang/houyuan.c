inherit ROOM;

void create()
{
        set("short", "后院");
        set("long", @LONG
这里是后院，北面是三清殿，南面是一个圆形的门洞，有
条小路通往后山。
LONG);
        set("exits", ([
                "south" : __DIR__"xiaolu1",
                "north" : __DIR__"sanqingdian",
        ]));
        set("objects", ([
                CLASS_D("wudang") + "/yu" : 1
        ]));
        setup();
        replace_program(ROOM);
}
