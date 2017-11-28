inherit ROOM;

void create()
{
	set("short", "南厅");
	set("long", @LONG
这里是衙门东厅，是知府招待客人的所在。厅中摆着一张杉木圆桌和
几张椅子，桌上是一套精致的宜兴瓷器。墙上挂着一幅中堂，画的是猛虎
下山，乃是知府的手笔。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"north" : __DIR__"yamen",
	]));

	setup();
	replace_program(ROOM);
}
