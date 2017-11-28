inherit ROOM;

void create()
{
	set("short", "铁枪庙");
	set("long", @LONG
这铁枪庙祀奉的是五代时名将铁枪王彦章。庙旁有座高塔，
塔顶群鸦世代为巢，乡民传说铁枪庙的乌鸦是神兵神将，向来
不敢侵犯，以致生养繁殖，越来越多。
LONG);
	set("exits", ([
                "west"  : __DIR__"jxnanmen",
		"north" : __DIR__"nanhu",
        ]));
        setup();
        replace_program(ROOM);
}
