inherit ROOM;

void create()
{
        set("short", "草原");
        set("long", @LONG
这是一片无边无际的草原，半人高的青草随风而动，正如
江湖中的你，随著江湖之中汹涌的波涛，四处飘摇。你想到江
湖中的无奈，不禁沧然泪下。 
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
  		"west" : __DIR__"caoyuan4",
  		"east" : __DIR__"caoyuan2",
	]));

	setup();
	replace_program(ROOM);
}
