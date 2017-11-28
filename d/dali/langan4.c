//Room: /d/dali/langan4.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","杆栏中层");
	set("long",@LONG
这里是杆栏的中层，从楼梯一上来就是祭所。南诏蛮夷大多信奉
自己部族特有的神明，家家户户都居中室设案供奉。中层的其余房间
则为寝所。此屋靠窗摆了一部纺纱机。
LONG);
	set("objects", ([
	   __DIR__"npc/fangshanu": 1,
	   __DIR__"obj/fangshaji": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "down"      : __DIR__"langan3",
	]));
	setup();
	replace_program(ROOM);
}

