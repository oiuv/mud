inherit ROOM;
void create()
{
	set("short", "巴的甸");
	set("long", @LONG
这里就是大理西部要镇巴的甸，是乌夷的重要治府，多
个乌夷部落分布在附近。坐于东泸水谷地正中，巴的甸四周
多农田，以此为中心，道路四通八达连接各方的部落。
LONG);
	set("outdoors", "dali");
	set("exits", ([
	    	"north"      : __DIR__"zhenxiong",
	    	"south"      : __DIR__"lushui",
	    	"eastup"     : __DIR__"lushuieast",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

