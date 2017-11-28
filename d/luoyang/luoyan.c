inherit ROOM;

void create()
{
	set("short", "落燕厅");
	set("long", @LONG
四小厅借沉鱼落燕羞花闭月之典故而起名，此厅内高爽宽敞，窗台明
亮。堂中挂一幅无名小画，设一张白木卧榻。桌凳之类，色色洁净。打扫
得地下无纤毫尘垢。堂中花卉无所不有，十分繁茂。真个四时不谢，八节
长春。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"jiyuan2",
	]));

	setup();
	replace_program(ROOM);
}
