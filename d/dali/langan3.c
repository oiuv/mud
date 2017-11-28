//Room: /d/dali/langan3.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","杆栏");
	set("long",@LONG
一间摆夷族的杆栏民居，此间下层没有牛羊，却用竹席围成一个养
桑蚕的小棚屋，有竹架竹盘。楼上传来阵阵纺纱机的梭飞声。
LONG);
	set("objects",([
	    __DIR__"npc/yangcannu" : 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "west"   : __DIR__"nongtian5",
	    "up"     : __DIR__"langan4",
	]));
	setup();
	replace_program(ROOM);
}

