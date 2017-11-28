inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这里是山路的尽头，南面好象有一片小树林，折而向东就
是终南山的山脚了。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "northwest" : __DIR__"shanlu2",
                "eastup" : __DIR__"shanjiao",
        ]));
        setup();
        replace_program(ROOM);
}
