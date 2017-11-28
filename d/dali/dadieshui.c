//Room: /d/dali/dadieshui.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","大叠水瀑布");
	set("long",@LONG
延山间小路越丘陵，过村庄，穿田野，约二，三里后，隐隐听见
水流的轰鸣，续前进，在一片坡地的前端，呈现倒丫字形深箐，那巨
大的轰鸣声，就是从这箐沟里传出的。延坡上的之字形小路攀藤扶石
眼前。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northwest"  : __DIR__"chahuashan6",
	    "eastdown"   : __DIR__"xiaojing",
	    "southdown"  : __DIR__"qingxi",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

