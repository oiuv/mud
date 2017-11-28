//zhandao2.c
inherit ROOM;

void create()
{
        set("short", "栈道");
        set("long", @LONG
这里是通往明教的栈道，脚下茂林生云，极其艰险。
    远远看到上头就是明教内三堂美仑美奂的飞檐画栋了。
LONG);
        set("exits", ([
                "northup"   : __DIR__"tianweitang",
                "southdown" : __DIR__"zhandao1",
        ]));
        set("outdoors", "mingjiao");
        setup();
        replace_program(ROOM);
}
