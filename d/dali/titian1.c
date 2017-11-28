//Room: /d/dali/titian1.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","梯田");
	set("long",@LONG
东泸水河谷气候较温暖，乌夷先民沿山坡开垦了不少梯田。此间
乃是低坡，层层梯田沿坡而上，土地看来并不肥沃，作物较稀疏，乌
夷地区农业颇为落后，多行换季轮耕，附近山上的一些梯田在这个季
节正荒芜着。
LONG);
	set("objects", ([
	   __DIR__"npc/nongfu": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "west"      : __DIR__"zhenxiong",
	]));
	setup();
	replace_program(ROOM);
}

