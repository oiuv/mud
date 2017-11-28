inherit ROOM;

void create()
{
	set("short", "文定南街");
	set("long", @LONG
这是中州文定南街，宽敞的街道看的人不竟心情一畅。街
对面好象有一家茶楼。可进出的人你看着总觉得有点不对劲。
LONG);
	set("no_clean_up", 0);
	set("objects", ([
  		__DIR__"npc/qiying" : 1,
	]));
	set("exits", ([
  		"east" : __DIR__"maodun",
  		"north" : __DIR__"wendingnan1",
  		"west" : __DIR__"chalou",
  		"south" : __DIR__"wendingnan3",
	]));

	set("outdoors", "zhongzhou");

	setup();
	replace_program(ROOM);
}
