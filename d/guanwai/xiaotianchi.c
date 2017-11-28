// /guanwai/xiaotianchi.c

inherit ROOM;

void create()
{
	set("short", "小天池");
	set("long", @LONG
小天池又称长白镜湖，圆圆如镜。湖水碧蓝，林海峭壁倒映其间，风光
幽丽，一层绿里透红的细沙，均匀地铺在湖底，恰似展开着的一幅金丝绒毯。
相传天上仙女每日天池中沐浴，洗毕就到天豁峰的峰颠，坐在两个峰尖中间
的开阔岩石上，对着小天池打扮梳妆，故名镜湖。
LONG );
	set("exits", ([
		"eastup"  : __DIR__"pubu",
		"west"    : __DIR__"heifengkou",
	]));
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}
