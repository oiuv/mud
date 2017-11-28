// Room: /d/suzhou/beimen.c
// Date: May 31, 98  Java

inherit ROOM;

string look_gaoshi();
void create()
{
	set("short", "北门");
	set("long", @LONG
这是苏州府的北城门。出门远远可见西面的虎丘山。放眼
望去尽是绿的田，翠的草和清清的小河。门边官兵身后贴着一
份告示(gaoshi)。南北一条笔直的官道。
LONG );
	set("outdoors", "suzhou");
	set("item_desc", ([
		"gaoshi" : (: look_gaoshi :),
	]));
	set("exits", ([
		"north" : __DIR__"road1",
		"south" : __DIR__"beidajie2",
	]));
	set("objects", ([
		"/d/city/npc/wujiang" : 1,
		"/d/city/npc/bing" : 2,
	]));
	setup();
}

string look_gaoshi()
{
	return FINGER_D->get_killer() + "\n苏州知府\n冯正东\n";
}

