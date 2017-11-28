inherit ROOM;

void create()
{
        set("short", "青石路");
        set("long", @LONG
由于离中州渐远，路上见不到多少行人，你心里不由也紧
张起来。北面可以通向中州府，西边不远便是军事重地襄阳城。
LONG);
        set("exits", ([
  		"west" : "/d/xiangyang/eastgate2",
  		"north" : __DIR__"nroad",
	]));

	set("outdoors", "zhongzhou");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
