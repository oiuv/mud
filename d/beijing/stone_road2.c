inherit ROOM; 

void create() 
{  
	set("short", "碎石小路"); 
	set("long", @LONG
小路是用五彩缤纷的石子铺成的。石子组成了各种花纹，甚是好看。路边
池塘里荷花亭亭，蜻蜓飞来飞去，只有偶尔传来的几声蛙鸣打破了四周的宁静。
东面有几间厢房，是供镖局里的镖师及其家眷居住的。
LONG); 

  	set("exits", ([
  		"north" : __DIR__"pavillion",
  		"south" : __DIR__"stone_road",
  		"west" : __DIR__"cabinet",
	]));

	setup(); 
	replace_program(ROOM); 
} 
