inherit ROOM;

void create()
{
	set("short", "官道");
	set("long", @LONG
这里是一条尘土飞扬的大官道，它是连接汝州的主干道。官
道很是宽广，足可容得下十马并驰。
LONG);
	set("exits", ([
		"west"  : __DIR__"shang_road1",
		"east"  : __DIR__"shang_road3",
	]));
	set("outdoors", "ruzhou");
	setup();
	replace_program(ROOM);
}
