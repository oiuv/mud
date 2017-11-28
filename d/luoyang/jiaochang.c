inherit ROOM;

void create()
{
	set("short", "大校场");
	set("long", @LONG
这里是用来校阅军士的地方。只见校场正中巍巍搭着一座高台，台南
排列着千余张椅子板凳。台前竖着两根旗杆，旗杆顶上还有着硕大的旗斗。
校场里聚集着数百名官兵和武将，看来这里将要进行阅兵式。
LONG);
        set("outdoors", "luoyang");
	set("no_clean_up", 0);
	set("exits", ([
  		"north" : __DIR__"wroad4",
	]));
        set("objects", ([
                "/d/kaifeng/npc/guanbing" : 2,
                "/d/city/npc/wujiang" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
