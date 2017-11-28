inherit ROOM;

void create()
{
        set("short", "酒楼二楼");
        set("long", @LONG
这里是雅座，文人学士经常在这里吟诗作画，富商土豪也
在这里边吃喝边作交易。这里也是城里举办喜宴的场所。你站
在楼上眺望，只觉得心怀坦荡。四周全是漫漫的黄沙，比之江
南的花香鸟语，气势更是浩荡。
LONG);
        set("objects", ([
                __DIR__"npc/zhanggui" : 1,
        ]));

        set("exits", ([
                "down" : __DIR__"jiulou1",
        ]));

        setup();
        replace_program(ROOM);
}
