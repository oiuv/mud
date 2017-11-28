inherit ROOM;

void create()
{
	set("short", "小路");
        set("long", @LONG
这里是一条上山的小路，小路向西分出一条岔道。山路周
围很是寂静，北边是山贼的老窝，常常有土匪出没于此。
LONG);
	set("outdoors", "baituo");
	set("exits", ([
		"north"     : __DIR__"dongkou",
		"southwest" : __DIR__"xiaolu3",
	]));
	set("objects", ([
		__DIR__"npc/shanzei2" : 1,
	]));
	setup();
	replace_program(ROOM);
}
