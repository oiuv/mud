inherit ROOM;

void create()
{
	set("short", "书院");
	set("long", @LONG
这里是书院的讲堂，窗明几净，一尘不染。一位老夫子坐
在太师椅上讲学。在他的两侧坐满了求学的学生。一张古意盎
然的书案放在他的前面，案上摆着几本翻开了的线装书籍。
LONG );
	set("exits", ([
		"east" : __DIR__"nandajie3",
	]));
	set("objects", ([
		__DIR__"npc/jiaoxi" : 1,
	]));

	setup();
	replace_program(ROOM);
}
