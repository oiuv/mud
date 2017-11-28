inherit ROOM;

void create()
{
        set("short", "大道");
        set("long", @LONG
这是一条青石大道。东面隐约可以看到扬州城的城墙。向
西看去，只见群山起伏，青翠碧绿，不知通向哪里。
LONG);
        set("exits", ([
                "northeast" : __DIR__"road1",
                "southwest" : __DIR__"road3",
        ]));

        set("no_clean_up", 0);
        set("outdoors", "city");

        setup();
        replace_program(ROOM);
}

