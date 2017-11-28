inherit ROOM;

void create()
{
        set("short", "厨房");
        set("long", @LONG
这里是大轮寺的厨房，新来的僧人可以在此打杂。房中醒
目的位置有一块牌子，但已经破旧不堪，字迹模糊了。
LONG);
        set("exits", ([
                "south" : __DIR__"xiaoyuan",
        ]));

        set("objects", ([
                __DIR__"obj/cha" : 2 + random(2),
                __DIR__"obj/nailao" : 2 + random(2),
        ]));

        set("resource/water", 1);

        set_temp("times" , 5);
        setup();
}
