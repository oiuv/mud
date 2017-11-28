// /clone/board/taohua_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("归云庄记事板", ({ "board" }) );
	set("location", "/d/guiyun/qianyuan");
	set("board_id", "guiyun_b");
	set("long", "这是一个专供桃花岛弟子在岛外使用的留言板。\n" );
	setup();
	set("capacity", 100);
	replace_program(BULLETIN_BOARD);
}

