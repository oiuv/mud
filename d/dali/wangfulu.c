inherit ROOM;

void create()
{
	set("short","王府路");
	set("long",@LONG
镇南王府前大道，延伸两里余。街面是由碗口大的彩色
石块铺砌而成，青兰紫绿煞是好看。城内居民族裔繁杂，习
俗各异，饮食穿着无不异于中原。太学生们的朗朗之声透室
可闻。北面是一座连云府院，‘镇南’、‘保国’两面大旗
矗立门前。
LONG);
	set("objects", ([
	   	CLASS_D("duan") + "/fu": 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"west" : __DIR__"paifang",
	    	"north" : __DIR__"wangfugate",
	]));
	setup();
	replace_program(ROOM);
}

