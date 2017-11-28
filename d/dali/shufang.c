inherit ROOM;

void create()
{
	set("short", "书房");
	set("long", @LONG
这是大理国镇南王的书房，靠窗放着一个大木桌桌上放着不少书，
靠墙的地方还有一个书架，镇南王经常在这里看书。
LONG);
	set("objects",([
	    	CLASS_D("duan") + "/zhu" : 1,
	]));
	set("exits", ([
	    	"west"  : __DIR__"tingfang",
	]));
	setup();
	replace_program(ROOM);
}

