inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
你走在一条尘土飞扬的黄土路上。西面望去，隐隐可以看
到平定州。望东，北京城快到了。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
                "east" : "/d/beijing/ximenwai",
                "west" : __DIR__"pingdingzhou",
        ]));
        setup();
        replace_program(ROOM);
}
