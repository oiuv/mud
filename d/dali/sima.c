inherit ROOM;

void create()
{
	set("short","司马堂");
	set("long",@LONG
这里是大理国司马堂。大理东北强宋，西北吐蕃，历年
来边疆宁靖，皆司马劳顿之功。盖吐蕃垂涎大理已久，每每
强辞胁迫，大理不得不重兵于西北。
LONG);
	set("objects", ([
	    	CLASS_D("duan") + "/fan" : 1,
	]));
	set("exits", ([
	    	"west"  : __DIR__"zonglichu",
	]));
	setup();
	replace_program(ROOM);
}

