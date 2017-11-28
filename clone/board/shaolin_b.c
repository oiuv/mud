// /clone/board/shaolin_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("少林弟子留言板", ({ "board" }) );
	set("location", "/d/shaolin/guangchang1");
	set("board_id", "shaolin_b");
	set("long", "这是一个供少林弟子交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}
