// Room: /d/xiangyang/guofuyuan.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "郭府大院");
	set("long", @LONG
这里是郭府的大院，当面一堵宽阔的白玉照壁，上书“忠
心报国”四个大字，地下是一色的青砖铺地，四周种了几棵大
树，有几个仆役正在院中洒扫，北面是郭府的客厅,。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);
	set("exits", ([
		"south" : __DIR__"guofugate",
		"north" : __DIR__"guofuting",
	]));
	setup();
	replace_program(ROOM);
}

