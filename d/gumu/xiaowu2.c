
inherit ROOM;

void create()
{
        set("short", "蜂屋");
        set("long", @LONG
这里是小龙女喂养训练玉蜂的蜂屋，屋角上挂着很多个六
角形的蜂巢，还未进门，就闻得到一阵蜂蜜的甜香。
LONG
        );

        set("exits", ([
                "west" : __DIR__"xiaoting",
                "east" : __DIR__"xiaowu3",
        ]));

        set("objects", ([
                __DIR__"obj/fengmi" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
