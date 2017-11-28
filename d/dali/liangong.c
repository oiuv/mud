inherit ROOM;

void create()
{
        set("short", "练武场");
        set("long", @LONG
这里是一个不太的院子，是锻炼武功的地方。段家虽然
世代皇族，但是和江湖却有着割不断的联系。因此段家子孙
有无数武道高手，这里就是他们练功的场地。东南就是王府
内院，北面则通往另一个练武场。
LONG);
        set("exits", ([
                "north" : __DIR__"liangong2",
                "southeast" : __DIR__"yongdao1",
        ]));
        set("for_family", "段氏皇族");
        setup();
        replace_program(ROOM);
}
