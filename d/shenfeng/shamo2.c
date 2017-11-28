inherit ROOM;

void create()
{
	set("short", "大漠风光");
	set("long", @LONG
地势到这是豁然开朗，你的西边是一望无际的沙漠。狂风
在呼哮，漫天黄沙在飞舞，飞沙滚滚。沙砾打在你的身上，就
像是苍穹怒投下的冰雹。冥冥中仿佛已有种邪恶的力量，任何
人随时都有可能突然像野狗般死在沙砾上。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
		"west" : __DIR__"shamo3",
		"east" : __DIR__"shamo1",
	]));
	setup();
	replace_program(ROOM);
}
