// /clone/board/yipin_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("一品堂留言板", ({ "board" }) );
	set("location", "/d/lingzhou/yipindayuan");
	set("board_id", "yipin_b");
	set("long", "这是一个供一品堂交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

