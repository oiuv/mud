// /clone/board/hengshan_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("恒山弟子留言板", ({ "board" }) );
	set("location", "/d/hengshan/baiyunan");
	set("board_id", "hengshan_b");
	set("long", "这是一个供恒山门下交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

