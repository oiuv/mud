#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", NOR + HIB "\n\n                饿        鬼        道" NOR);
        set("long", HIB "\n"
"哀嚎四起，环顾周围，遍是咽细如针，口大如炬，腹鼓如山的\n"
"饿鬼。前世造作的善恶业不同，在饿鬼道所受的果报也会不同。\n"
"饿鬼多是汲汲于饮食，但却四处奔走求食不能，所见池水却都\n"
"变成脓血而不能饮用，不是遇水成火就是喉细无法咽食。\n\n" NOR);
        setup();
}

