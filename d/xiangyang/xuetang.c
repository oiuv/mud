// Room: /d/xiangyang/xuetang.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "学堂");
	set("long", @LONG
这里是襄阳的学堂，窗明几净，一尘不染。一位庄重严肃
的老先生坐在太师椅上讲学。在他的两侧坐满了求学的学生。
一张古意盎然的书案放在老先生的前面，案上摆着几本翻开了
的线装书籍。
LONG );
	set("exits", ([
		"west" : __DIR__"southjie1",
	]));
	set("objects", ([
		__DIR__"npc/laoxiansheng" : 1,
	]));
	setup();
	replace_program(ROOM);
}
