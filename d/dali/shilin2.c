//Room: /d/dali/shilin2.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","和摩赛石林");
	set("long",@LONG
旧名石门峰或石门峭，石质黝黑古朴，气势磅礴，有如大海怒涛
冲天而起，境巧细致的东西较少，当你身临其境，踏石磴，入石门，
拨野草，探幽林，但觉山禽鸣岗，危石森森，其间原野开阔，山风阵
阵，花香悠悠，一股强烈的山野味迎面而来，不加修饰的粗犷的自然
美，令人耳目一新。
LONG);
	set("outdoors", "dali");
	set("objects",([
	    "/d/wudang/npc/tufei1": 2,
	    "/d/wudang/npc/tufei2": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "southwest"    : __DIR__"changhu",
	]));
	setup();
	replace_program(ROOM);
}

