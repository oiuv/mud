inherit ROOM;

void create()
{
	set("short", "清和殿后院");
	set("long", @LONG
这里是清和殿后院。院里种着些青菜。墙角有一口水井(well)。
站在水井边往下看，只觉深不见底，井壁上满是滑溜溜的青苔。一个
轱辘吊着一根长绳，绳端系着一个木桶。东边是一条走廊，通往清和
殿。
LONG );
        set("outdoors", "huanggong");
	set("resource/water", 1);
	set("exits", ([
		"east" : __DIR__"zoulang1",
	]));

	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

