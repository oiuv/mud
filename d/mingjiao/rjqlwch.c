//RJQLWCH.C

inherit ROOM;

void create()
{
	set("short", "练武场");
	set("long", @LONG
走进了锐金旗的练武场，发现这里有些奇怪。练武的教众
们并不是在相互切磋，而是穿戴着特制的护具，同一架奇怪的
装置打斗。装置从不移开原地，只是它似乎具备用不完的各种
兵器，进攻起来丝毫不弱于江湖好手。
LONG );
	set("exits", ([
		"north" : __DIR__"rjqyuan",
	]));

	set("no_clean_up", 0);
//	set("outdoors", "mingjiao");
	setup();
	replace_program(ROOM);
}
