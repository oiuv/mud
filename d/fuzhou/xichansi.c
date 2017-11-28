// Room: /d/fuzhou/xichansi.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "西禅寺");
	set("long", @LONG
西禅寺始建于梁朝，寺中玉佛楼玉佛为整玉雕就，宝相
庄严，从来香火不绝。香客往来，但有所求，多得灵验。
LONG );
	set("exits", ([
                "north" : __DIR__"ximendajie",
	]));
	set("objects", ([
                "/d/wudang/npc/guest" : 1,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

