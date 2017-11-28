inherit ROOM;

void create()
{
        set("short", "天台");
        set("long", @LONG
这里是大轮寺的高处。北边可见雄伟的大雪山，南边可以
俯瞰美丽如镜的圣湖。
LONG);
        set("exits", ([
                "west" : __DIR__"chanshi",
        ]));

        set("objects", ([
                CLASS_D("xueshan") + "/huodu" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
