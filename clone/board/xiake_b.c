// /clone/board/xiake_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("侠客岛留言板", ({ "board" }) );
	set("location", "/d/xiakedao/dating");
	set("board_id", "xiake_b");
	set("long", "这是一个供来到侠客岛的贵宾交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

