inherit ROOM;

void create()
{
	set("short", "花亭");
	set("long", @LONG
你穿过商家堡的后院，来到一个花亭前。花亭以蓝色琉璃砌
成。出了花亭，是一条清幽的花径，两旁修竹姗姗，花径鹅卵石
上生满青苔，显得平素少有人行。
LONG);
	set("exits", ([
		"west"  : __DIR__"shang_houyuan",
	]));
	setup();
	replace_program(ROOM);
}
