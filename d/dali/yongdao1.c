//Room: /d/dali/yongdao1.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","甬道");
	set("long",@LONG
这是镇南王府的甬道。两边是密密的树林，风吹得树叶沙沙声响
石砌的甬道路面两侧，是如茵的绿草，点缀着一星半点的小花，周围
十分安静。唯独西北角传来一阵阵打斗的声音，在这谧静的环境越发
听得真切。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northeast" : __DIR__"yongdao2",
            "northwest" : __DIR__"liangong",
	    "south"     : __DIR__"tingfang",
	]));
	setup();
	replace_program(ROOM);
}

