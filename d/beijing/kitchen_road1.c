inherit ROOM; 
 
void create ()
{
  set ("short", "小路");
  set ("long", @LONG
一条弯弯曲曲的小路。路边绿草间稀稀疏疏地种了几株月季，三两只小鸡
小鸭正在漫步啄食。西北边是后院小花园，不时传来阵阵鸟语花香。
LONG);

  	set("exits", ([
  		"east" : __DIR__"kitchen_road2",
  		"west" : __DIR__"dining_room",
  		"northwest" : __DIR__"e_garden",
	]));

	setup(); 
	replace_program(ROOM); 
} 
