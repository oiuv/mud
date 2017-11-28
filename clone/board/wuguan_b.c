inherit BULLETIN_BOARD;

void create()
{
        set_name("郭府家丁留言板", ({ "board" }) );
        set("location", "/d/wuguan/guofu_dayuan");
        set("board_id", "wuguan_b");
        set("long", "这是一个供在郭府打杂的家丁们交流的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}

