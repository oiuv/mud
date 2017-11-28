inherit ROOM;

void create()
{
	set("short", "小路");
	set("long", @LONG
官道旁的一条小路，因为平时过往之人不多的缘故，周围都
已长满了杂草。远远的向西望去，似乎有一座大宅。
LONG);
	set("exits", ([
		"west"  : __DIR__"shang_road2",
		"north"  : __DIR__"shang_men",
	]));
	set("outdoors", "ruzhou");
	setup();
	replace_program(ROOM);
}
