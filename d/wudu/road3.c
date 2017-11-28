inherit ROOM;

void create()
{
        set("short", "黄土大道");
        set("long", @LONG
这是一条向南的黄土大道，远处隐约看见一片翠绿的山峦。路上
行人逐渐稀少起来，大路越走越窄，有些地方竟长出了一片片的杂草。
东边似乎有一条岔路。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "southeast" : __DIR__"xiaolu",
                "south" : __DIR__"shanlu1",
                "north" : __DIR__"road2",
        ]));

        setup();
        //replace_program(ROOM);
}
