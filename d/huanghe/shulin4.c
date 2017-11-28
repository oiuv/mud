inherit ROOM;

void create()
{
	set("short", "树林");
        set("long", @LONG
树林里光线暗淡，只能听见头顶传来一些鸟儿的啼鸣。偶
而从茂密的叶间透过的一线光伴着落叶在飞舞。朽木腐烂的气
味和身後传来野兽的啸声使人不觉犹豫了前进的脚步。
LONG);
	set("exits", ([
		"northwest" : __DIR__"shulin5",
		"east"      : __DIR__"shulin3",
		"south"     : __DIR__"shulin2",
	]));
        set("quarrys", ([
                "tu"        : 100000,
                "ji"        : 80000,
                "pao"       : 50000,
                "caihuashe" : 50000,
                "dushe"     : 20000,
                "hu"        : 5000,
                "bao"       : 2000,
                "laohu"     : 2000,
        ]));
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

