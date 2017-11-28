inherit ROOM;

void create()
{
        set("short", "雪坑");
        set("long", @LONG
这是大雪山脚下的一个雪坑，坑内四周光线阴暗，什么都
看不清楚。躲进这里，你感到暖和了一些。
LONG);
        set("exits", ([
                "northup"   : __DIR__"sroad3",
        ]));
        set("objects", ([
                "/clone/worm/xixuezhu" : 2,
        ]));
        setup();
}

