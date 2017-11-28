inherit ROOM; 

void create() 
{  
	set("short", "碎石小路"); 
	set("long", @LONG
小路是用五彩缤纷的石子铺成的。石子组成了各种花纹，甚是好看。路边
池塘里荷花亭亭，蜻蜓飞来飞去，只有偶尔传来的几声蛙鸣打破了四周的宁静。
小路的两边有几间厢房，是供镖局里的镖师趟子手及其家
眷居住的。
LONG); 

  	set("exits", ([
  		"east" : __DIR__"stone_road4",
  		"west" : __DIR__"stone_road",
	]));

	setup(); 
	replace_program(ROOM); 
} 
