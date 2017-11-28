inherit ROOM;

void create()
{
        set("short", "道具房");
        set("long", @LONG
这是一间道具房。摆着一些桃花弟子们常用的东西。房里
好象黑乎乎的，靠窗处有一张斑驳长桌和一把靠背椅，虽是白
天还点着小油灯。哑仆看到你进来，就使劲瞪着你，虽然口不
能言，可你还是心中惴惴。
LONG);
        set("exits", ([
                "west" : __DIR__"dating",
                "up"   : __DIR__"shufang",
        ]));

        if (random(5) > 3)
                set("objects", ([
                        __DIR__"npc/yapu"  : 2,
                        __DIR__"obj/bagua" : 1,
                        __DIR__"obj/xiang" : 1,
                        __DIR__"obj/zhuxiao" : 1,
                ]));
        else
        if (random(4) > 2)
                set("objects", ([
                        __DIR__"npc/yapu"  : 2,
                        __DIR__"obj/xiang" : 1,
                        __DIR__"obj/zhuxiao" : 1,
                ]));
        else
                set("objects", ([
                        __DIR__"npc/yapu"  : 2,
                        __DIR__"obj/zhuxiao" : 1,
                ]));

        setup();
}
