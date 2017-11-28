inherit ROOM;

void create()
{
        set("short", "榕树上");
        set("long", @LONG
这里是大榕树的顶端，四周是浓密的枝叶和湿漉漉的苔藓。
突然间一阵微风吹来，树叶发出唰啦啦的声音。从上面望下去
你只觉得一阵眼晕，心想还是赶快下去吧。
LONG);
        set("outdoors", "wudujiao");
        set("exits", ([
                "down" : __DIR__"nanyuan",
        ]));
        set("objects", ([
                  __DIR__"obj/xiang": 1,
        ]));
        setup();
        //replace_program(ROOM);
}
