// /clone/board/xueshan_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("大轮寺弟子留言板",({ "board" }) );
	set("location", "/d/xueshan/dadian");
	set("board_id", "xueshan_b");
        set("long","这是供大轮寺弟子传递信息用的留言板\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}
