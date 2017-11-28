inherit ROOM;

void create()
{
        set("short", "东厢走廊");
        set("long", @LONG
你走在一条走廊上，隐约可以听到东边传来呼吸声，似乎
有人正在那里练功，北边有一扇门，好象是虚掩着。南边是间
竹子扎就的屋子，十分的素雅，里面飘出一阵阵的茶香，有人
轻声细语地不知说那些什么，引得女孩子笑出声来。
LONG);

    	set("exits", ([
                "south" : __DIR__"chashi",
                "north" : __DIR__"xiuxishi",
                "west"  : __DIR__"donglang1",
                "east"  : __DIR__"liangongfang",
        ]));
        setup();
}