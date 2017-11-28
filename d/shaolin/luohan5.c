// Room: /d/shaolin/luohan5.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "罗汉堂五部");
	set("long", @LONG
这是一间极为简陋的禅房。环视四周，除了几幅佛竭外，室
内空荡荡地别无他物。地上整齐的摆放着几个破烂且发黑的黄布
蒲团，几位须发花白的老僧正在坐在上面闭目入定。这里是本寺
十八罗汉参禅修行的地方，不少绝世武功便是在此悟出。一位小
沙弥在一边垂手站立。
LONG );
	set("exits", ([
		"west" : __DIR__"wuchang2",
		"south" : __DIR__"luohan4",
		"north" : __DIR__"luohan6",
	]));
	set("objects",([
		CLASS_D("shaolin") + "/xuan-ku" : 1,
		CLASS_D("shaolin") + "/cheng-jian" : 1,
		__DIR__"npc/xiao-ku" : 1
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

