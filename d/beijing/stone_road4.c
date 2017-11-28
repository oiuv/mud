inherit ROOM; 

void create() 
{  
	set("short", "碎石小路"); 
	set("long", @LONG
小路是用五彩缤纷的石子铺成的。石子组成了各种花纹，甚是好看。路边
池塘里荷花亭亭，蜻蜓飞来飞去，只有偶尔传来的几声蛙鸣打破了四周的宁静。
路的两旁各有一座大宅。
LONG); 

  	set("exits", ([
  		"south" : __DIR__"son_cabinet1",
  		"north" : __DIR__"son_cabinet2",
  		"west" : __DIR__"stone_road3",
  		"east" : __DIR__"rain",
	]));

	setup(); 
	replace_program(ROOM); 
} 
