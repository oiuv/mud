inherit ROOM;

void create()
{
	set("short","花厅");
	set("long",@LONG
这里是镇南王府的内厅。整个大厅十分宽阔。虽说是王府，但摆
设很简单，正中间有两张太师椅，边上摆满了各种各样的山茶花。
LONG);
	set("objects", ([
	    	CLASS_D("duan") + "/gu" : 1,
	]));
	set("exits", ([
	    	"north"  : __DIR__"yongdao1",
	    	"west"   : __DIR__"chufang",
	    	"east"   : __DIR__"shufang",
	    	"south"  : __DIR__"changlang",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

