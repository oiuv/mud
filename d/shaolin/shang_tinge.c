inherit ROOM;

void create()
{
	set("short", "东厅");
	set("long", @LONG
偏厅布置的颇为优雅，丝毫没有正厅上的严肃气氛。一张红
木大桌边上有个书柜，柜里摆了各式各样的书。墙上挂着几幅字
画。看来客人少时，这里又可以当书房用。
LONG);
	set("exits", ([
		"west"  : __DIR__"shang_dating",
	]));
	setup();
	replace_program(ROOM);
}
