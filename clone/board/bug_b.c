inherit BULLETIN_BOARD;

void create()
{
	set_name("炎黄 BUG 留言版", ({ "board" }) );
	set("location", "/d/wizard/bug_room");
	set("board_id", "bug_b");
	set("long", "请您注意您的留言主题和内容。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}