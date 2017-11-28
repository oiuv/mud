// /clone/board/wudang_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("星宿派弟子留言板",({"board"}));
	set("location", "/d/xingxiu/xxh2");
	set("board_id", "xingxiu_b");
	set("long", "这是供星宿门下留言的板子.\n");
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

