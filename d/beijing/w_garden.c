inherit ROOM; 
 
void create ()
{
  	set ("short", "后花园");
  	set ("long", @LONG
一个小花园，虽然比不上富豪大院里的万紫千红，但也布置得精致可人。
镇远镖局里显然不乏高雅之士。春天里桃花盛开，夏日池塘里荷花田田，秋天
里菊花争艳，冬天则是一片香雪海。
LONG);

  	set("exits", ([
  		"east" : __DIR__"c_garden",
  		"south" : __DIR__"pianting",
	]));

	setup(); 
	replace_program(ROOM); 
} 
