//TOHSQ1.C

inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
这里是一条很普通的山路，路边的树林密集，芳草流香，草丛
中星星点点地点缀着一些白色野花，一股清泉叮叮咚咚地向山下流
淌，远处传来阵阵水声，为这山谷陡增了几分气势。
LONG );
	set("exits", ([
		"southeast" : __DIR__"torjq3",
		"northwest" : __DIR__"tohsq2",
	]));
	set("outdoors", "mingjiao");
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
