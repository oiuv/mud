// Room: /d/fuzhou/fzroad1.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "廿八铺");
	set("long", @LONG
廿八铺高居仙霞岭上，四望群山连绵，长风振岗，十分爽利。
这里是个很小的小村落，虽然南来北往的客商繁多，可是也只有
一家小小客店。
LONG );
	set("exits", ([
		"north"     : __DIR__"fzroad1",
		"southdown" : __DIR__"fzroad2",
		"west"      : __DIR__"kedian",
	]));
        set("objects", ([
		"/d/huashan/npc/haoke" : 2,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

