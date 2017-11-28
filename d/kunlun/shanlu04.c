inherit ROOM;

void create()
{
	set("short", "山路");
        set("long", @long
前面传来刀剑相碰的声音，快到了，你不由得加快了脚步，
远远望去，似乎是个大广场，围着不少人在练武。
long);
        set("exits",([
		"northdown" : __DIR__"shanlu03",
		"south" : __DIR__"guangchang",
		"southwest" : __DIR__"guangchangw",
		"southeast" : __DIR__"guangchange",
	]));

	set("outdoors", "kunlun");
	setup();
	replace_program(ROOM);
}
