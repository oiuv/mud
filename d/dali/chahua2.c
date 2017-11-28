inherit ROOM;

void create()
{
	set("short","茶花园");
	set("long",@LONG
大理茶花冠绝天下，镇南王府的茶花自然更非凡品。你
站在茶花园中，看万紫千红，争奇斗妍，心胸大爽。靠东面
有一座小石方凳，凳后柳树成行，拖曳水面，把那湖面点成
了一个个涟漪。
LONG);
	set("objects", ([
	   	__DIR__"obj/chahua1": 1,
	   	__DIR__"npc/huanu": 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"west"  : __DIR__"chahua1",
	    	"northeast"  : __DIR__"chahua3",
	    	"southeast"  : __DIR__"chahua4",
	]));
	setup();
	replace_program(ROOM);
}

