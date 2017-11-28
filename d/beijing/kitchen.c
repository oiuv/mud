// Room: /d/zhenyuan/kitchen.c
// created by agah 
 
inherit ROOM; 
 
void create ()
{
  	set ("short", "厨房");
  	set ("long", @LONG
厨房里打扫的很干净。几口大锅里冒出阵阵香气，令人垂涎欲滴。几个丫
鬟正在收拾蔬菜。一个小管家来来回回地跑，大概在打下手。
LONG);

  	set("exits", ([
  		"west" : __DIR__"kitchen_road2",
	]));

	setup(); 
	replace_program(ROOM); 
} 
