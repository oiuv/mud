// /clone/board/henshan_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("衡山弟子留言板", ({ "board" }) );
	set("location", "/d/henshan/zhurongdian");
	set("board_id", "henshan_b");
	set("long", "这是一个供衡山门下交流的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}
