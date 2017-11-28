inherit ROOM;

void create()
{
	set("short", "贵宾室");
	set("long", @LONG
这是一间贵宾室，这里窗明几亮，用具考究。单是窗边
一架紫竹软榻已是价值不菲。凭窗眺望，隐隐于淡烟之中可
见苍山的玉局峰，翠碧欲滴，令人心旷神怡。
LONG);
	set("exits", ([
	    	"south"      : __DIR__"zoulang3",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

