// /guanwai/tuyaoguan.c

inherit ROOM;

void create()
{
	set("short", "土窑馆");
	set("long", @LONG
一迈进这间小房，一股脂粉混合着大蒜的味道扑鼻而来，差点把你呛了
一个跟头。屋内点着很多蜡烛和灯笼，把四壁照得通红。很多穿着破烂的汉
子，一手搂着姑娘，一个握着酒壶，正在高谈阔论。一个肥胖的老鸦一遍招
待着客人，一遍大声催促的这里的伴当和姑娘们。
LONG );
	set("exits", ([
		"north" : __DIR__"dongcheng",
	]));
	set("objects", ([
		__DIR__"npc/jiaowenqi" : 1,
	]));
//	set("no_clean_up", 0);
//	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}

