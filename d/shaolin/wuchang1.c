inherit ROOM;

void create()
{
	set("short", "练武场");
	set("long", @LONG
这里是少林寺的练武场。由无数块巨大的花岗岩石板铺就。
上千年的踩踏已使得这些石板如同镜子般平整光滑。练武场中
间竖立着不少木人。十来个僧人正在练习武艺。东面有一长溜
僧房。
LONG );
	set("exits", ([
		"south" : __DIR__"zoulang2",
		"west" : __DIR__"banruo5",
		"east" : __DIR__"wuchang",
		"north" : __DIR__"zoulang6",
	]));
	set("outdoors", "shaolin");

	setup();
	replace_program(ROOM);
}

