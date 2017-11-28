// Room: /d/suzhou/bailianchi.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "白莲池");
	set("long", @LONG
白莲池位于二仙亭的北面，池中种有千叶莲花，池上架彩
莲曲桥，相传吴王夫差与西施曾在此采莲赏荷。
LONG );
	set("outdoors", "suzhou");
//	set("no_clean_up", 0);
	set("exits", ([
		"south" : __DIR__"erxianting",
	]));
	set("objects", ([
		__DIR__"npc/lady2" : 1,
	]));
	setup();
	replace_program(ROOM);
}

