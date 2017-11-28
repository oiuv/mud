inherit ROOM;

void create()
{
	set("short", "武侯祠大门");
	set("long", @LONG
这里原来是武侯祠。大门人进人出，大多缠着武侯巾。原
来武侯生前治蜀，造福两川，这武侯巾乃是他去世川人为其带
孝之俗。由于武侯遗爱甚深，虽千载以下川人头巾仍不去首。
LONG);
        set("outdoors", "chengdu");
	set("exits", ([
		"northeast" : __DIR__"southroad3",
		"north"     : __DIR__"liubeidian",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
