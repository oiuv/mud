inherit ROOM;

void create()
{
        set("short", "晒谷场");
        set("long", @LONG
这里是村庄中心的晒谷场，地方不大，不过村里也就五六
户人家，种的谷子也够晒了。现在正是收获的季节，谷场中堆
满了谷子，几个男女童子正在场中嬉闹，不时地扬起一捧谷子
相互撒去。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "southeast" : __DIR__"xiaocun",
                "north" : __DIR__"cunzhangjia",
                "northwest" : __DIR__"minju3",
                "southwest" : __DIR__"minju4",
        ]));
        set("objects", ([
                __DIR__"npc/boy" : 2,
                __DIR__"npc/girl" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
