inherit ROOM;

void create()
{
        set("short", "伊犁");
        set("long", @LONG
这里是一座维吾尔族聚居的小镇。镇上人来人往，十分热
闹。只是他们说的话你听不懂。镇西有家小店铺，西北边人声
鼎沸，好像在举行什么比赛。东面有家院落，院门口有棵大树。
北边是一家马厩。
LONG);
        set("exits", ([ 
            "west"      : __DIR__"store",
            "east"      : __DIR__"house",
            "north"     : __DIR__"majiu",
            "northwest" : __DIR__"saimachang",
            "southeast" : __DIR__"shanjiao",
        ]));

        set("objects", ([
                __DIR__"npc/woman": 2,
	]));

        set("outdoors", "xingxiu");
        setup();
        replace_program(ROOM);
}

