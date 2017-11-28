// /clone/board/bonze_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("少林弟子留言板", ({ "board" }) );
	set("location", "/d/shaolin/dxbdian");
	set("board_id", "bonze_b");
	set("long", "这是一个供少林弟子交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}
