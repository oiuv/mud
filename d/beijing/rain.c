inherit ROOM; 

void create() 
{  
	set("short", "听雨楼"); 
	set("long", @LONG
一座两层的碧绿色小竹楼, 三面环水, 窗外一泓秋水，池边花树映水而红，
灿若云霞；池中零，残荷点点。一方平台傍水而建，白石为栏，碧玉为砖。台
面晶莹剔透，平整如镜，隐隐有红光流动。乍看是花影，细看方知那红色已深
透玉石纹理，仿佛是丝丝血络一般。屋中央摆了一张棋秤, 上面还有半局残棋。
屋子里空空空荡荡, 只有三俩把竹椅．此处幽静宜人，似乎是一个极好的静修
之处。
LONG); 

  	set("exits", ([
  		"up" : __DIR__"shulou",
  		"west" : __DIR__"stone_road4",
	]));

	setup(); 
	replace_program(ROOM); 
} 
