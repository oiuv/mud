// Room: /d/xiangyang/guofukefang.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "客房");
	set("long", @LONG
这里是郭府客人们的住处，整整齐齐的一排平房。门的左
右两边各是一张床，床上的被褥被叠得整整齐齐。床头正对的
地方摆着一张桌子，旁边还放着一张椅子。桌上整齐地放着文
房四宝，旁边还放着几本书。地上摆着一盆牡丹花，一丝清香
萦绕房中。因为郭靖是当今的大英雄，所以江湖上有不少豪杰
每年都来拜访他。
LONG );
	set("no_clean_up", 0);
	set("sleep_room", 1);
	set("exits", ([
		"east" : __DIR__"guofuhuayuan",
	]));
	setup();
	replace_program(ROOM);
}

