// /guanwai/rouguan.c

inherit ROOM;

void create()
{
	set("short", "香肉馆");
	set("long", @LONG
这是一间很小的狗肉馆，屋内有一个很大的土炕，几乎占去了房间的一
半。炕中是一个火灶，上架一口大铁锅，香喷喷的热气从锅中不断冒出。饭
馆的老板坐在锅旁，不断的给客人盛上一碗碗热腾腾的肉汤。
LONG );
	set("exits", ([
		"east"  : __DIR__"nancheng",
	]));
	set("objects", ([
		__DIR__"npc/laoban" : 1,
	]));
//	set("no_clean_up", 0);
//	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}

