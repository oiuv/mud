inherit ROOM;

void create()
{
        set("short", "回春居");
        set("long", @LONG 
这就是凌霄城中医术最高明的戴大夫所开的回春居，一进这
里，就闻到一股刺鼻的药味，只见房中摆满了大大小小的箱笼药
柜。一名须发皆白的老人坐在桌旁，正在替一人把脉。旁边墙上
贴着一张张条幅(tiaofu)，都是被阎大夫治好了的病人送的。
LONG );
        set("item_desc", ([
                "tiaofu" : "华佗再世,扁雀重生。\n",
        ]));
        set("objects", ([
                __DIR__"npc/daifu" : 1,
        ]));
        set("exits", ([
                "west" : __DIR__"iceroad2",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

