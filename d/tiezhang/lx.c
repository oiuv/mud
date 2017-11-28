// Room: /u/zqb/tiezhang/lx.c

inherit ROOM;

void create()
{
	set("short", "泸溪");
	set("long", @LONG
这里是湘西的一个小镇。虽然此地地处偏僻，但这里来往的行人仍然很
多。西面是一间供人休息打尖的小客店。西南方四十里处，就是此处有名的
猴爪山。
LONG	);
	set("outdoors", "tiezhang");
	set("exits", ([ /* sizeof() == 3 */
		"southwest" : __DIR__"road-1",
		"north" : __DIR__"hunanroad2",
		"west" : __DIR__"kedian",
	]));

	setup();
	replace_program(ROOM);
}
