// /clone/board/wudang_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("逍遥派弟子留言板",({"board"}));
	set("location","/d/xiaoyao/qingcaop");
	set("board_id", "xiaoy_b");
	set("long", "这是供逍遥派门下留言的板子.\n");
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

