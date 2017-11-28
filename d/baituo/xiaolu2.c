inherit ROOM;

void create()
{
	set("short", "小路");
        set("long", @LONG
这里是一条上山的小路。山路周围很是僻静，连个人影也
没有。周围常有山贼土匪出没，行路需得小心谨慎。
LONG);
	set("outdoors", "baituo");
	set("exits", ([
		"northup"   : __DIR__"xiaolu3",
		"southdown" : __DIR__"xiaolu1",
	]));
	set("objects", ([
		__DIR__"npc/man" : 1,
	]));

	setup();
	replace_program(ROOM);
}
