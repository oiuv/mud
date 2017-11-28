inherit ROOM;

void create()
{
	set("short","走廊");
	set("long",@LONG
这是一条长长的走廊，通向各个客人的寝室。你来到了
二楼，毛毡已经换成纯白，两侧木壁上或刻有花鸟鱼虫，或
挂了些许时人的字画，每隔七八步，就有一处香台，缕缕青
烟从铜鹤嘴里游出，闻之精神一振。
LONG);
	set("exits", ([
	    "north" : __DIR__"guibingshi1",
	    "west" : __DIR__"zoulang1",
	    "east" : __DIR__"zoulang4",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

