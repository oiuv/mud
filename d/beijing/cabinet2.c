// Room: /d/zhenyuan/cabinet2.c
// created by agah 

inherit ROOM;

void create ()
{
  	set ("short", "威武阁二楼");
  	set ("long", @LONG
这间卧房颇为阔朗，窗口一张紫檀木大案，文房四宝齐备，又有一盆小小
盆景，绿意盎然。转过屏风，迎面只见一幅写意山水，笔势纵横。旁边就是卧
榻，垂着水红纱帐，绣了些花鸟。
LONG);

  	set("exits", ([
  		"enter" : __DIR__"shufang",
  		"down" : __DIR__"cabinet",
	]));
  	setup();
        replace_program(ROOM);
}
