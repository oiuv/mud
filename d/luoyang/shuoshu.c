inherit ROOM;

void create()
{
	set("short", "说书大厅");
	set("long", @LONG
这里就是说书大厅，一位四十多岁的中年人正坐在大厅中央手拿折扇
，摇头晃脑说个不停，三国演义，楚汉相争，薛纲反唐，大隋唐，明英烈，
西游记，水浒传等等，这位说书先生是样样精通，正说的唾液横飞。周围
的人听的是津津有味，不住的点头称道。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"chalou2",
	]));
        set("objects", ([
                "/d/beijing/npc/chaboshi" : 1,
                "/d/beijing/npc/teahuoji" : 1,
                "/d/beijing/npc/chake" : 4,
        ]));
	setup();
	replace_program(ROOM);
}
