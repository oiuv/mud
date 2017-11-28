// /clone/board/gaibang_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("丐帮弟子留言板", ({ "board" }) );
	set("location", "/d/city/pomiao");
	set("board_id", "gaibang_b");
	set("long", "这是一个供丐帮弟子交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

