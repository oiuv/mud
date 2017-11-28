// Room: /guiyun/shulin2.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "树林");
	set("long", @LONG
树林里光线暗淡，只能听见头顶上传来一些鸟儿的啼鸣。偶而从
茂密的叶间透过的一线光伴着落叶在飞舞。朽木腐烂的气味和身後传
来野兽的啸声使人不觉犹豫了前进的脚步。
LONG );
        set("outdoors", "guiyun");
//	set("no_clean_up", 0);
	set("exits", ([
		"southeast" : __DIR__"shulin3",
		"northwest" : __DIR__"shulin1",
		"west"      : __DIR__"shulin5",
	]));
	set("objects", ([
		__DIR__"npc/gaosan" : 1,
		__DIR__"npc/fengliang" : 1,
	]));
	setup();
	replace_program(ROOM);
}
