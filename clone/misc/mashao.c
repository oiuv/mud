/* mashao.c 马哨 */

#include <ansi.h>

inherit __DIR__"whistle";

void create()
{
    set_name( HIG "马哨" NOR, ({ "ma shao", "shao" }) );
    if ( clonep() )
        set_default_object( __FILE__ );
    else {
        set( "unit", "个" );
        set( "long", "这是一个竹子制成的马哨，上面有镇远镖局的标志。\n" );
        set( "family", 1 );
        set( "whistle", 5 );
    }

    setup();
}
