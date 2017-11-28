inherit ROOM;

void create()
{
        set("short", "林间小道");
        set("long", @LONG
这是一条长长的林间小道，从东边一直通到西边，一眼望
去，看不到路的尽头。两旁百花争艳。令人留连忘返。南边好
象有香味散发出来，北边是个兵器房。
LONG);
        set("exits", ([
                "south" : __DIR__"shantang",
                "east" : __DIR__"xiaodao1",
                "west" : __DIR__"xiuxis",
                "north" : __DIR__"bingqif",
        ]));
        set("outdoors", "xiaoyao");
        setup();
        replace_program(ROOM);
}
