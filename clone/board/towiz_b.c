// /clone/board/towiz_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("玩家意见留言板", ({ "board" }) );
	set("location", "/d/wizard/guest_room");
	set("board_id", "towiz_b");
	set("long", "这是一个供玩家和巫师交流的留言板。\n" );
	setup();
	set("capacity", 1000);
	replace_program(BULLETIN_BOARD);
}

