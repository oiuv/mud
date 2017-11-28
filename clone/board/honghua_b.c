// /clone/board/honghua_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("红花会弟子留言板", ({ "board" }));
	set("location", "/d/kaifeng/hh_zhengting");
	set("board_id", "soo_b");
	set("long", "这是一个供红花会众交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

