// /clone/board/murong_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("慕容家弟子留言版", ({ "board" }) );
	set("location", "/d/yanziwu/canheju");
	set("board_id", "murong_b");
	set("long", "这是一个供慕容家弟子交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

