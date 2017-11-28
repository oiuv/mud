inherit ROOM;

void create()
{
	set("short", "西厅");
	set("long", @LONG
这里是衙门的西厅，乃是知府的书房。书案上凌乱地放着
几本发黄的古籍。引起你的注意的是墙上挂着一幅很大的地图。
LONG);
	set("item_desc", ([
		"ditu" : "这是一幅扬州市区和市郊的地图，上面有各种颜色的圈圈点点。\n",	
	]));
	set("exits", ([
		"east" : __DIR__"ymzhengting",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

