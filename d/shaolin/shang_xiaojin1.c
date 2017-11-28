inherit ROOM;

void create()
{
	set("short", "碎石小径");
	set("long", @LONG
商家堡广场后面的一条碎石铺砌的小径，可以由它前往商家
堡的大厅所在。不时有商家堡的下人过往于此。
LONG);
	set("exits", ([
		"north"  : __DIR__"shang_xiaojin2",
		"south"  : __DIR__"shang_qgc",
	]));
	setup();
	replace_program(ROOM);
}
