#include <ansi.h> 
inherit BULLETIN_BOARD;

void create()
{
        set_name(HIY "【武林外传】"NOR+HIW"留言板" NOR, ({ "board" }) );
        set("location", "/d/city/wfoxd");
        set("board_id", "wfoxd_b");
        set("long", "这就是【武林外传】的留言板，可留言，不可灌水。\n" );
        setup();
        set("capacity", 1000);
        replace_program(BULLETIN_BOARD);
}

