//TOHTQ1.C

inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
这里是一条很普通的山路，路边的树林密集，芳草流香，草丛
中星星点点地点缀着一些白色野花，路面也越来越干燥，远处可见
阵阵尘土飞扬，为这山谷陡增了几分生气。
LONG );
	set("exits", ([
		"southwest" :__DIR__"tojmq3",
		"northeast" :__DIR__"tohtq2",
	]));
	set("outdoors", "mingjiao");
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
