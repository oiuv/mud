inherit BULLETIN_BOARD;

void create()
{
	set_name("玩家交流留言版", ({ "board" }) );
	set("location", "/d/wizard/player_room");
	set("board_id", "heroplayer_b");
	set("long", "自由自在，畅所欲言。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}