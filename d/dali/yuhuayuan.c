inherit ROOM;

void create()
{
        set("short", "御花园");
        set("long", @LONG
这里是大理国皇宫的御花园，两旁的花开得争奇斗艳，边
上有一个小水池，山上流下来的泉水就会集在那里，几只仙鹤
在水边抓鱼，一副旁若无人的样子，往北是花廊。
LONG);
        set("objects", ([
                "/clone/quarry/he": 1,
        ]));
        set("outdoors", "dali");
        set("exits", ([
                "north"  : __DIR__"hualang",
                "south"  : __DIR__"qiandian",
        ]));
        setup();
        replace_program(ROOM);
}
