inherit ROOM;

void create()
{
	set("short","山路");
	set("long",@LONG
你走在衡山山路上，四望山峰错落，林壑幽深，溪泉飞瀑，
云雾缭绕，不觉心胸大快。再往前不远便是紫盖峰了。
LONG);
	set("exits",([
	        "southdown" : __DIR__"shanlu15",
	        "northup" : __DIR__"zigai",
	]));
	
	set("outdoors", "henshan");    
          
	setup();
	replace_program(ROOM);
}  	
