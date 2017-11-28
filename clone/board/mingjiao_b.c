// /clone/board/mingjiao_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("明教教众留言板", ({ "board" }) );
	set("location", "/d/mingjiao/square");
	set("board_id", "mingjiao_b");
	set("long", "这是一个供明教教众交流的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}
