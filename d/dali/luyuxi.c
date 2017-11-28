//Room: /d/dali/luyuxi.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","绿玉溪沿岸");
	set("long",@LONG
一条颇宽敞的土路沿着绿玉溪南岸横贯东西，一边是涓涓溪流碧
波荡漾，另一边是青山翠柳，郁郁葱葱的林木。东面有桥渡溪通向大
理城南门，西去不远就是五华楼了。
LONG);
	set("outdoors", "dali");
	set("exits",([
	    "east"      : __DIR__"shuangheqiao",
	    "west"      : __DIR__"gudao",
	    "south"     : "/d/wudu/road1",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

