inherit BULLETIN_BOARD;

void create()
{
        set_name("苗家弟子留言板", ({ "board" }) );
        set("location", "/d/zhongzhou/miaojia_houting");
        set("board_id", "miao_b");
        set("long", "这是一个供苗家弟子交流的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}

