inherit BULLETIN_BOARD;

void create()
{
        set_name("镇远镖局留言板", ({ "board" }) );
        set("location", "/d/beijing/zhengting");
        set("board_id", "zhenyuan_b");
        set("long", "这是一个供八卦门弟子交流的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}

