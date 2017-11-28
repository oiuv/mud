inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
你走在一条黄土路上。这里已经是陕西地面了，向南一条
黄土大道，两边望不尽的黄土高坡，没有一丝吝啬的绿色。东
北隐隐传来流水的声响。
LONG );
        set("outdoors", "heimuya");
        set("exits", ([
                "northeast" : "/d/huanghe/weifen",
                "south"     : __DIR__"road6",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
