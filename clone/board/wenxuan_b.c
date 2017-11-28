inherit BULLETIN_BOARD;

void create()
{
	set_name("炎黄 文选 发表版", ({ "board" }) );
	set("location", "/d/wizard/wenxuan");
	set("board_id", "wenxuan_b");
	set("long", "请您注意您的留言主题和内容。\n" );
	setup();
	set("capacity", 200);
	replace_program(BULLETIN_BOARD);
}