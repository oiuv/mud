// Room: /d/zhenyuan/c_garden.c
// created by agah 
 
inherit ROOM; 
 
void create ()
{
  	set ("short", "后花园");
  	set ("long", @LONG
这里是一个小花园，虽然比不上富豪大院里的万紫千红，但却也布置得精
致可人。镇远镖局里显然不乏高雅之士。春天里桃花盛开，夏日池塘里荷花田
田，秋天里菊花争艳，冬天则是一片香雪海。
LONG);

  	set("exits", ([
  		"east" : __DIR__"e_garden",
  		"west" : __DIR__"w_garden",
  		"south" : __DIR__"zhengting",
  		"north" : __DIR__"stone_road",
	]));

	setup(); 
	replace_program(ROOM); 
} 
