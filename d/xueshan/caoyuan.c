inherit ROOM;

void create()
{
        set("short", "草原");
        set("long", @LONG
这里是雪山脚下的一片草原。北面是起伏的群山，山顶上
积着终年不化的雪。西边有一条土路。
LONG);

        set("exits", ([
                "west"      : __DIR__"tulu1",
                "northeast" : "/d/xingxiu/silk4" ,
        ]));

        set("objects", ([
                "/clone/quarry/tu" : 4 ,
        ]));

        set("outdoors", "xuedao");

        setup();
        replace_program(ROOM);
}
