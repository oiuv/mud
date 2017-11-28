inherit ROOM;

void create()
{
	set("short","苍山山路");
	set("long",@LONG
此处正当河边，两侧山壁几乎是直上直下，面前是一条
大河自北滔滔而来，在此折向东，咆哮而去。河水奔腾汹涌
之极，拍击河岸，发出一阵阵骇人的轰响。这恰缝河湾，河
床较窄，河谷上并无桥梁，只有三根粗藤条横跨两岸，这端
绑在一棵大树上，似可攀援而过。
LONG);
	set("objects", ([
	   	__DIR__"npc/lieren": 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"northeast" : __DIR__"cangshanzhong",
	    	"west" : __DIR__"heshang",
	]));
	setup();
	replace_program(ROOM);
}

