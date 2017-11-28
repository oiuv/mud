inherit ROOM; 
 
void create ()
{
  	set ("short", "账房");
  	set ("long", @LONG
这里就是镇远镖局的账房，地方不大但是很清静，除了账房先生天天在这
里统计管理镖局里的帐务外，平时很少有其他的人光顾这里，房间里“噼噼啪
啪”的珠算声不绝于耳，让人听听也觉得烦。不过每个月初月末，镖局里的众
多趟子手和大小镖师都可以来这里领取工资。
LONG);

  	set("exits", ([
  		"east" : __DIR__"front_yard",
	]));

  	set("objects", ([
        	__DIR__"npc/kongyiji": 1,
        ]));

	setup(); 
	replace_program(ROOM); 
} 
