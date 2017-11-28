inherit ROOM;

void create()
{
	set("short", "高昌废墟");
	set("long", @LONG
陡然间眼前一片空旷，此时朝阳初升，只见景色奇丽，莫
可名状。一座白玉山峰参天而起，峰前一排排的都是房屋。千
百所房屋断垣剩瓦，残破不堪，已没一座完整，但建筑规模宏
大，气象开朗，可见当年是一座十分繁荣的城市。
LONG);
        set("outdoors", "shenfeng");

	set("exits", ([
  		"east" : __DIR__"shibi",
  		"west" : __DIR__"feixu2",
	]));

	setup();
	replace_program(ROOM);
}
