inherit ROOM;

void create()
{
	set("short", "同仁堂药店");
	set("long", @LONG
这是一家老字号的药店。未入此处，清新的药香已沁人心裨。店中有
各种名药，玲琅满目，不乏珍奇异种。有些有起死回生的功效。药店中的
摆设也十分考究，桌椅被勤快的伙计擦的干干净净。墙上挂满了别人送来
的谢匾。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"west" : __DIR__"sroad2",
	]));
        set("objects", ([
                "/d/city/npc/huoji" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
