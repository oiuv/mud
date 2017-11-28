inherit ROOM;

void create()
{
	set("short", "星星峡");
	set("long", @LONG
峡内两旁石壁峨然笔立，有如用刀削成，抬头望天，只觉
天色又蓝又亮，宛如潜在海底仰望一般。峡内岩石全是深黑色
显得乌光发亮。道路弯来弯去，曲折异常。峡内初有积雪，黑
白相映，蔚为奇观。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
  		"west" : __DIR__"caoyuan6",
  		"east" : __DIR__"xingxing1",
	]));
	setup();
	replace_program(ROOM);
}
