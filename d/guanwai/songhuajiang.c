// /guanwai/songhuajiang.c

inherit ROOM;

void create()
{
	set("short", "松花江面");
	set("long", @LONG
这里是松花江的江面，冰面早已解冻，清澈的江水涛涛北去，两岸是如
烟如雾松支，柳条。船夫悠闲地在船尾把着舵。
LONG );
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}
