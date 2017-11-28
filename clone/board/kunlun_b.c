// /clone/board/kunlun_b.c

inherit BULLETIN_BOARD;

void create()
{
        set_name("昆仑弟子留言板", ({ "board" }) );
        set("location", "/d/kunlun/sanshengtang");
        set("board_id", "kunlun_b");
        set("long", "这是一个供昆仑派弟子交流的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}

