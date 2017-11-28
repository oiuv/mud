// /clone/board/quanzhen_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("全真派弟子留言板", ({ "board" }) );
	set("location", "/d/quanzhen/datang1");
	set("board_id", "quanzhen_b");
	set("long", "这是一个供全真派门下交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

