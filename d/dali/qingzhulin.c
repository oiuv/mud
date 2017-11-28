//Room: /d/dali/qingzhulin.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","青竹林");
	set("long",@LONG
一大片茂密的青竹林向西面山里蔓延出去。此间竹子青嫩，竹笋
遍地，附近卢鹿族的台夷妇女常前来采摘竹笋为食，另外也砍伐些青
竹用来制做竹筒和编织的竹篾筐篓。
LONG);
	set("objects", ([
	   __DIR__"npc/caisunren": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "east"   : __DIR__"wuding",
	]));
	setup();
	replace_program(ROOM);
}

