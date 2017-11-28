//Room: /d/dali/yuxuguan.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","玉虚观");
	set("long",@LONG
玉虚观内十分清检，正中供着张果老、吕洞宾、何香姑等八仙的
塑像，香火缭绕，供桌上摆着些蟠桃。正中放了几个蒲团。旁边一个
小间里摆着桌椅，是玉虚散人休息和授徒的地方。
LONG);
	set("objects", ([
	   CLASS_D("duan")+"/daobf": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "south"  : __DIR__"yuxuguanqian",
	]));
	setup();
	replace_program(ROOM);
}

