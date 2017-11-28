inherit ROOM;

void create()
{
	set("short", "东门");
	set("long", @LONG
这里是中州的东城门。出城是一条大驿道，外地到中州的
人都从这里进中州城，官府在这里设关卡查问过往行人。一到
局势不稳的时候这里就特别的紧张。
LONG);
        set("objects", ([
                "/d/kaifeng/npc/guanbing" : 4,
                "/d/beijing/npc/ducha" : 1,
        ]));
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : "/d/suzhou/road4",
  		"west" : __DIR__"yanlingdong2",
	]));
	set("outdoors", "zhongzhou");

	setup();
	replace_program(ROOM);
}
