inherit ROOM;
string look_gaoshi();

void create()
{
	set("short", "西门");
	set("long", @LONG
你来到了西城门外，只见高大的城墙厚实凝重，卫兵仔细
地盘查着过往行人，一切都显得井井有条。城墙上贴着几张告
示(gaoshi)。西面远远可以看到城外的清溪碧水。
LONG);
        set("outdoors", "chengdu");
	set("item_desc", ([
		"gaoshi" : (: look_gaoshi :),
	]));
	set("exits", ([
		"west"  : __DIR__"nanheqiaow",
		"east"  : __DIR__"westroad2",
	]));
	set("objects", ([
		"/d/city/npc/wujiang" : 1,
		"/d/city/npc/bing"    : 2,
	]));
	setup();
	//replace_program(ROOM);
}

string look_gaoshi()
{
	return FINGER_D->get_killer() + "\n成都提督\n吴天德\n";
}
