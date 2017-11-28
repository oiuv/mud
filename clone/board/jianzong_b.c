// /clone/board/jianzong_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("华山剑宗弟子留言板", ({ "board" }) );
	set("location", "/d/huashan/xiaowu");
	set("board_id", "jianzong_b");
	set("long", "这是一个供华山剑宗门下交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

