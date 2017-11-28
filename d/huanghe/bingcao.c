inherit ROOM;

void create()
{
	set("short", "冰草湾");
	set("long", @LONG
冰草湾在营盘水的西南，平时人迹少至，因当地沙漠里长
着一种神奇的药草—冰草而得名。据说这种药草能解百毒，所
以偶有人来采这种草，不过常有毒虫出没，极为危险。
LONG);
	set("exits", ([
		"southwest" : __DIR__"shixiazi",
		"northeast" : __DIR__"yinpanshui",
	]));
	set("objects", ([
		"/clone/worm/qianjiewugong" : 1,
	]));
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

