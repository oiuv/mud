// Room: /d/shaolin/guangchang3.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "勤修场");
	set("long", @LONG
这是戒律院前的勤修场。这里是全寺交通最密集的地方，只
见一队队僧人来来去去，身着各种服色，有的携带刀，枪，棍，
杖等兵器，个个身姿矫健，神态庄重。北面的大殿就是戒律院，
四位僧兵持刀守在两侧。西边通向斋厅。
LONG );
	set("exits", ([
		"south" : __DIR__"guangchang2",
		"north" : __DIR__"guangchang4",
		"northup" : __DIR__"jlyuan",
		"west" : __DIR__"fanting",
	]));
	set("no_clean_up", 0);
	set("outdoors", "shaolin");
	setup();
}

int valid_leave(object me, string dir)
{
	mapping fam;

	if (dir == "northup")
	{
		if( mapp(fam = me->query("family")) 
		&&  fam["family_name"] == "少林派" 
		&&  fam["generation"] == 37  ) 
			return ::valid_leave(me, dir);
		
		if( me->query("guilty") == 0 
		&&  me->query("id") != "seng bing" )
		{
			return notify_fail("僧兵挡住说道：你未经许可，不能进入戒律院。\n");
		}
	}

	return ::valid_leave(me, dir);
}

