inherit BULLETIN_BOARD;

void create()
{
        set_name("天地会弟子留言板", ({ "board" }) );
        set("location", "/d/beijing/qingmu_dating");
        set("board_id", "tiandi_b");
        set("long", "这是一个供天地会弟子交流的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}

