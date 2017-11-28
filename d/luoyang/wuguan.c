inherit ROOM;

void create()
{
	set("short", "龙腾武馆");
	set("long", @LONG
龙腾武馆是专为初出江湖的少年设立的。由于江湖叛师是十分为人不
齿的，初出道的少年可以在此学习一些基本的防身武功，一来不会光阴虚
度，二来也好为今后选定一个心慕的门派。
LONG);
	set("exits", ([
  		"north" : __DIR__"wroad2",
  		"south" : __DIR__"wuguan2",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
