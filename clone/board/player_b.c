// /clone/board/player_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("江湖恩怨留言板", ({ "board" }) );
	set("location", "/d/city/chaguan");
	set("board_id", "player_b");
	set("long", "这是一个供玩家发泄江湖恩怨的留言板。谢绝人身攻击。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

