//TOHSQ4.C

inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
山路到这里似乎变得宽阔了些。清新的山风扑面而来，令人
精神顿为一爽。远处传来淙淙水声，渐行渐远。山壁上挂满
了厚密的藤萝，随风轻轻摇弋。
LONG );
	set("exits", ([
		"north" : __DIR__"tohsq5",
		"south" : __DIR__"tohsq2",
	]));
	set("outdoors", "mingjiao");
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
