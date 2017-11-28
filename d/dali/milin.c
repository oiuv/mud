//Room: /d/dali/milin.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","密林");
	set("long",@LONG
此处山道狭窄，林木特别茂密，山民踏出来的小道被纵横交错的
林木遮挡阻碍着，行路者不停地用刀劈砍开路，才能顺利前进。四面
青山峭立，丛林中时常有鸟兽惊走，偶尔还能看见美丽的孔雀飞过。
LONG);
	set("objects", ([
	   "/clone/beast/qingshe": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northeast"  : __DIR__"yangzong",
	    "southup"    : __DIR__"shanjian",
	]));
	setup();
	replace_program(ROOM);
}

