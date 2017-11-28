// Room: /d/fuzhou/fzroad4.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "闽赣古道");
	set("long", @LONG
福建境内数不尽的山坎相连。密林幽谷相继，终日不见天光。
山中毒虫猛兽出没无常，行路艰辛。
LONG );
	set("exits", ([
		"southwest" : __DIR__"fzroad5",
		"northeast" : __DIR__"yanping",
	]));
        set("objects", ([
		"/clone/beast/wubushe" : 1,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}
