
inherit ROOM;

void create()
{
	set("short", "塔院");
	set("long", @LONG
法王寺北山坡上，是法王寺塔院。院内有十五层密檐方塔，
高近二十丈，造型优美。院内其它三座单檐墓塔，亦玲珑秀丽。
LONG );
	set("exits", ([
		"southdown" : __DIR__"fawangsi",
	]));
	set("no_clean_up", 0);
	set("outdoors", "songshan");
	setup();
	replace_program(ROOM);
}

