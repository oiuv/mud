inherit ROOM;

void create()
{
	set("short", "全聚德酒楼");
	set("long", @LONG
这里就是京城中最为著名的全聚德酒楼。方圆数百里内提起全聚德酒楼的
烤鸭可以说是无人不知，无人不晓。楼内玲珑八角，红木铺地，雕栏玉砌，飞
檐上还挂着几个大红灯笼，装潢很是幽雅华丽。店小二抄着一口流利的京腔热
情的招呼着客人。酒楼西墙边有一个楼梯，通往全聚德酒楼二楼的雅座。
LONG );
	set("exits", ([
		"south" : __DIR__"wang_10",
		"up"   : __DIR__"quanjudeup",
	]));
	set("objects", ([
		__DIR__"npc/xiaoer1" : 1,
	]));

	setup();
	replace_program(ROOM);
}

