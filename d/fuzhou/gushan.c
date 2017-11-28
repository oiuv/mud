inherit ROOM;

void create()
{
	set("short", "鼓山");
	set("long", @LONG
鼓山以山上有石形如鼓，扣之如擂鼓而得名，非只山势如
鼓覆地。山上苍松滴翠，岩秀谷幽，风景秀丽，四季如春。有
晋以来，即为八闽二绝之一。
LONG );
	set("exits", ([
                "north"    : __DIR__"yongquan",
                "westdown" : __DIR__"shulin",
	]));
	set("objects", ([
                "/clone/quarry/hou" : 1,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

