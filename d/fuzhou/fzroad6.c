// Room: /d/fuzhou/fzroad6.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "闽赣古道");
	set("long", @LONG
福建境内数不尽的山坎相连。密林幽谷相继，终日不见天光。
山中毒虫猛兽出没无常，行路艰辛。一个粗豪汉子站在当道。
LONG );
	set("exits", ([
		"westdown" : __DIR__"fzroad7",
		"eastdown" : __DIR__"fzroad5",
	]));
        set("objects", ([
		"/d/qingcheng/npc/yu" : 1,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

