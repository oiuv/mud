//Room: /d/dali/yuxiashan.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","玉霞山");
	set("long",@LONG
玉霞山东镇星云湖，山清林秀，许多游人来此欣赏湖光山色，无
不为之倾倒。古人有诗曰：
      玉霞凄清秋气凉，
      星云湖水澄明光，
      近屿含烟凝紫翠，
      远山峭壁摩青苍，
      水光山色相辉映，
      万里无云碧天净。
LONG);
	set("objects", ([
	   __DIR__"npc/youke": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "westdown"  : __DIR__"xingyunhu",
	]));
	setup();
	replace_program(ROOM);
}

