// Room: /d/quanzhou/qzroad2.c
// Date: May 7, 96   Jay

inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
你走在一条山路上。时值春日，路旁的山坡上开满了金黄色的油菜花。
东面是江南名城嘉兴。西边望去，波光粼闪，白帆点缀，便是周遭五百里
的太湖了。
LONG );
	set("exits", ([
		"south" : __DIR__"qzroad3",
		"north" : __DIR__"qzroad1",
		"east"  : __DIR__"jiaxing",
		"west"  : "/d/yanziwu/hupan",
	]));
	set("no_clean_up", 0);
	set("outdoors", "quanzhou");
	setup();
	replace_program(ROOM);
}

