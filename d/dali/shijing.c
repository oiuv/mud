inherit ROOM;

void create()
{
        set("short", "石径");
        set("long", @LONG
你走在大理镇南王府中的石径上。路边长木遮天，微风习
习，十分凉爽。路南是一个碧绿透亮的小湖，水禽游鱼，映影
其间。西边通向大厅，东面好象是个花园。
LONG);
        set("objects", ([
                "/clone/quarry/he": 1,
        ]));
        set("outdoors", "dali");
        set("exits", ([
                "east" : __DIR__"tingyuan",
                "west" : __DIR__"wfdating",
        ]));
        setup();
        replace_program(ROOM);
}
