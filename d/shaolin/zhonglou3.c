// Room: /d/shaolin/zhonglou3.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "钟楼三层");
	set("long", @LONG
塔身往上似乎越来越窄，楼梯也渐为挤仄。扶手上不少朽
坏处续接了新木，漆色也是新旧不同。从窗孔往外望，往北可
以看到竹林中的藏经楼和方丈楼露出飞檐一角，往西则是后殿
的屋顶，屋脊上塑了个大大的“佛”字。
LONG );
	set("exits", ([
		"up" : __DIR__"zhonglou4",
		"down" : __DIR__"zhonglou2",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

