// Room: /d/shaolin/banruo7.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "般若堂七部");
	set("long", @LONG
这是一间极为简陋的禅房。环视四周，除了几幅佛竭外，室
内空荡荡地别无他物。地上整齐的摆放着几个破烂且发黑的黄布
蒲团，几位须发花白的老僧正在坐在上面闭目入定。这里是本寺
十八罗汉参禅修行的地方，不少绝世武功便是在此悟出。
LONG );
	set("exits", ([
		"south" : __DIR__"banruo6",
		"north" : __DIR__"banruo8",
	]));
	set("objects",([
		CLASS_D("shaolin") + "/cheng-ling" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

