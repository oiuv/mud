inherit ROOM;

void create()
{
        set("short", "工匠屋");
        set("long", @LONG
这里也是一间木屋，屋子中的摆设什么简单，但是却有很
多工具，锯子啦，刨子啦，锤子啦，还有满地的木屑，一看就
知道是一个工匠的家。
LONG);
        set("exits", ([
                "north" : __DIR__"mubanlu",
        ]));
        set("objects", ([
                CLASS_D("xiaoyao") + "/fengas" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
