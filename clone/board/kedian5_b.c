// /clone/board/kedian5_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("客店留言板", ({ "board" }) );
	set("location", "/d/fuzhou/rongcheng");
	set("board_id", "kedian5_b");
	set("long", "有有用的话就往这里说，乱灌水杀无赦。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

