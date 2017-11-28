// /clone/board/songshan_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("嵩山弟子留言板", ({ "board" }) );
	set("location", "/d/songshan/chanyuan");
	set("board_id", "songshan_b");
	set("long", "这是一个供嵩山门下交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

