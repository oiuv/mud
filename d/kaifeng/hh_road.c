inherit ROOM;

void create()
{
        set("short", "碎石路");
        set("long", @LONG
这是一条铺的十分平整的石板路，路面总是被打扫的干干
净净。南面过去是个花圆，传来阵阵花香，那里可以通往总舵
的大厅。北面则是一间小筑。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"northup" : __DIR__"hh_xiaozhu",
  		"south" : __DIR__"hh_huayuan",
	]));
        set("outdoors", "honghua");
        setup();
        replace_program(ROOM);
}
