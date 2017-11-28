inherit ROOM;

void create()
{
	set("short","楼梯");
	set("long",@LONG
这就是通往二楼「迎宾斋」的楼梯，整个楼梯高有五十
余级。上面铺了鲜红毛毡，楼梯两侧站了一些素衣卫士，楼
上则是贵宾休息的地方。
LONG);
	set("objects", ([
	   	CLASS_D("duan") + "/gao" : 1,
	]));
	set("exits", ([
	    	"up" : __DIR__"zoulang1",
	    	"south" : __DIR__"dating",
	]));
	setup();
	replace_program(ROOM);
}

