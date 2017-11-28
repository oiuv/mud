inherit BULLETIN_BOARD;

void create()
{
	set_name("匿名留言版", ({ "board" }) );
	set("location", "/d/wizard/noname_room");
	set("board_id", "noname_b");
	set("long", "说吧，没人知道是你。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}


       