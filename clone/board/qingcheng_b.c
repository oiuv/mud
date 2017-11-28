// /clone/board/qingcheng_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("青城弟子留言板", ({ "board" }) );
	set("location", "/d/qingcheng/songfengguan");
	set("board_id", "qingcheng_b");
	set("long", "这是一个供青城门下交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

