inherit ROOM;

void create()
{
	set("short","竹林深处");
	set("long",@LONG
这是一大片茂密的竹林，向南上山则是更茂密的阔叶林，鸟兽众
多。有经验的台夷猎人擅在竹林中下套、陷肼，捕捉兔、鹿等小兽，
或结伙持利刃上深山捕捉大些的猛兽。
LONG);
	set("objects", ([
	   	__DIR__"npc/lieshou" : 2,
	]));

	set("outdoors", "dali");
	set("exits",([
	        "north" : __DIR__"hexi",
	        "west"  : "/d/wudu/cun8",
	]));
	setup();
	replace_program(ROOM);
}

