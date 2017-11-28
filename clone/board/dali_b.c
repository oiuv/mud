// /clone/board/dali_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("大理段府留言板", ({ "board" }) );
	set("location", "/d/dali/wangfugate");
	set("board_id", "dali_b");
	set("long", "这是一个供大理段府门下交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

