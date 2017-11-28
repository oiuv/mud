// Room: /d/fuzhou/puxian.c
// Date: May 12 1998 Java

inherit ROOM;

void create()
{
	set("short", "莆仙平原");
	set("long", @LONG
你走在莆仙平原上。这里物产丰饶，人烟稠密，望北就
是福州府城了。往南就进入闽南。
LONG );
	set("exits", ([
		"north" : __DIR__"zhongzhou",
                "south" : "/d/quanzhou/beimen",
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

