inherit BULLETIN_BOARD;

void create()
{
        set_name("日月神教弟子记事板", ({ "board" }) );
        set("location", "/d/heimuya/chengdedian");
        set("board_id", "riyue_b");
        set("long", "这是一个专供日月神教弟子使用的留言板。\n" );
        setup();
        set("capacity", 100);
        replace_program(BULLETIN_BOARD);
}
