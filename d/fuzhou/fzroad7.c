inherit ROOM;

void create()
{
	set("short", "闽赣古道");
	set("long", @LONG
进入江西还是不尽的山坎和密林幽谷，终日不见天光。放
眼山中毒虫猛兽出没无常，行路艰辛。一到这里就闻到一股腥
风扑鼻而来。
LONG);
	set("exits", ([
		"northwest" : "/d/henshan/hsroad2",
		"eastup"    : __DIR__"fzroad6",
	]));
        set("objects", ([
		"/clone/quarry/laohu" : 1,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

