inherit ROOM;

void create()
{
	set("short", "大和街");
	set("long", @LONG
大道旁店铺林立，长街故朴，屋舍鳞次栉比，道上人来车
往，一片太平热闹景象。路口种了俩颗大菩提树。一踏入巷中
阵阵茶花香气扑鼻而来。
LONG);
	set("outdoors", "dali");
	set("exits", ([
	    	"north" : __DIR__"baiyiziguan",
	    	"south" : __DIR__"baiyiminju",
	    	"west"  : __DIR__"shizilukou",
	]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
