// Room: /guiyun/yixing.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "宜兴");
	set("long", @LONG
这儿便是天下闻名的陶都，青山绿水之间掩映着一堆堆紫砂陶坯，
另有一番景色。向东行，不远处就是太湖边。南方便是湖州府了。
LONG );
        set("outdoors", "guiyun");
	set("no_clean_up", 0);
	set("exits", ([
		"east"      : __DIR__"tiandi",
		"south"     : __DIR__"nanxun",
		"northwest" : "/d/wudang/wdroad2",
	]));
	setup();
	replace_program(ROOM);
}
