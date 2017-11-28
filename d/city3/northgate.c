inherit ROOM;
string look_gaoshi();

void create()
{
	set("short", "北门");
	set("long", @LONG
这是成都北城门，城门正上方刻着北门两个楷书大字，城
墙上贴着几张官府告示(gaoshi)。一条笔直的青石板大道向北
延伸。北边望去，一片绿油油的田野夹着随风摇曳的高树，长
竹。城门边两行官兵仔细盘查进出人等。
LONG);
        set("outdoors", "chengdu");
	set("item_desc", ([
		"gaoshi" : (: look_gaoshi :),
	]));
	set("no_fight",1);
	set("exits", ([
		"south"  : __DIR__"northroad2",
		"north"  : __DIR__"fuheqiaon",
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

