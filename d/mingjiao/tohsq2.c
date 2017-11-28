//TOHSQ2.C

inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
这里地势很陡峭，向北是一条连绵数十里的山谷，向南走，则
是去明教锐金旗方向的路。路两旁蜂舞蝶影，山花烂漫，好一派野
地风光。但就在那丛林深处，迭翠之中，又让人不觉感受到一阵萧
瑟的寒意。
LONG );
	set("exits", ([
		"southeast" : __DIR__"tohsq1",
		"northwest" : __DIR__"tohsq3",
		"north"     : __DIR__"tohsq4",
	]));
	set("no_clean_up", 0);
	set("outdoors", "mingjiao");
	setup();
	replace_program(ROOM);
}
