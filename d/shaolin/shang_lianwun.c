inherit ROOM;

void create()
{
	set("short", "练武场");
	set("long", @LONG
这里是商家堡厅后的一个练武场，空阔的场地上铺满了细细
的黄土，正好适合演武。不过这里杂草丛生，看样子已经荒废很
长一段时间了。
LONG);
	set("exits", ([
		"south"  : __DIR__"shang_houyuan",
	]));
	setup();
	replace_program(ROOM);
}
