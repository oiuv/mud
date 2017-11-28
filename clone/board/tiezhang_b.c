inherit BULLETIN_BOARD;

void create()
{
        set_name("铁掌帮弟子留言板", ({ "board" }) );
        set("location", "/d/tiezhang/guangchang");
        set("board_id", "tiezhang_b");
        set("long", "这是一个供铁掌帮弟子交流的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}

