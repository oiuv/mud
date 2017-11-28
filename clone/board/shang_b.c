inherit BULLETIN_BOARD;

void create()
{
        set_name("商家堡弟子留言板", ({ "board" }));
        set("location", "/d/shaolin/shang_dating");
        set("board_id", "shang_b");
        set("long", "这是一个专供商家堡弟子使用的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}

