inherit ROOM;

void create()
{
	set("short", "私塾");
	set("long", @LONG
这里是一家的私塾，窗明几净，一尘不染。一位庄重严肃的老先生坐
在太师椅上讲学。在他的两侧坐满了求学的学生。一张古意盎然的书案放
在老先生的前面，案上摆着几本翻开了的线装书籍。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"south" : __DIR__"eroad2",
  		"north" : __DIR__"mianbi",
	]));
        set("objects", ([
                "/d/wudu/npc/xuetong" : 2,
                "/d/wudu/npc/xiansheng" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
