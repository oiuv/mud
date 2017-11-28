// Room: /d/shaolin/zhulin6.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "竹林小道");
	set("long", @LONG
这是一条卵石铺成的小道，曲曲折折地通向前方。两边是密
密的竹林。这里人迹罕至，惟闻足底叩击路面，有僧敲木鱼声；
微风吹拂竹叶，又如簌簌禅唱。令人尘心为之一涤，真是绝佳
的禅修所在。
LONG );
	set("exits", ([
		"east" : __DIR__"hsyuan6",
		"south" : __DIR__"zhulin5",
	]));
	set("no_clean_up", 0);
	set("outdoors", "shaolin");
	setup();
	replace_program(ROOM);
}

