inherit ROOM;

void create()
{
	set("short", "玄冥峰山脚");
	set("long", @LONG
这是玄冥峰山脚，再往前走就是玄冥谷了。四周树木葱绿，绿草深
长。山鸡野兔肆意奔跑。
LONG );
	set("exits", ([
		"eastdown"  : __DIR__"xiaolu1",
		"northwest" : __DIR__"shanlu1",
	]));

	set("outdoors", "xuanming");
	setup();
	replace_program(ROOM);
}

