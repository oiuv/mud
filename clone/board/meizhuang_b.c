inherit BULLETIN_BOARD;

void create()
{
        set_name("梅庄弟子留言板", ({ "board" }) );
        set("location", "/d/meizhuang/houting");
        set("board_id", "meizhuang_b");
        set("long", "这是一个专供梅庄弟子使用的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}

