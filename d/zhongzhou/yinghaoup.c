inherit ROOM;

void create()
{
	set("short", "英豪酒家二楼");
	set("long", @LONG
这是英豪酒家二楼雅座，如果靠窗坐的话，街上行人可以
尽收眼底，你如果喜欢清净一点，就在里面包间。边上还有个
单间，喝多了可以上里面小酣片刻。
LONG);

	set("exits", ([
		"west" : __DIR__"xiuxishi",
		"down" : __DIR__"yinghao",
	]));
        set("objects", ([
  		"/d/beijing/npc/richman1" : 1,
	]));

	setup();
}