inherit ROOM;

void create()
{
	set("short", "郭府花园");
	set("long", @LONG
这里是郭府的花园，园内假山林立，西边种着些青竹，东
边是几棵枝叶茂盛的木笔花树。你一走进来，就闻到一阵阵清
新的、淡淡的花香。
LONG);
        set("no_fight", 1);
	set("exits", ([
		"east"  : __DIR__"guofu_woshigh",
		"west"  : __DIR__"guofu_kefang",
		"south" : __DIR__"guofu_lang5",
		"north" : __DIR__"guofu_shufang",
	]));
	set("objects", ([
		CLASS_D("taohua") + "/rong" : 1,
	]));
	setup();
	replace_program(ROOM);
}

