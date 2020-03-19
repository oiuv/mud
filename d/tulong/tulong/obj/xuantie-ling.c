#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(CYN "玄铁令" NOR, ({ "xuantie ling", "xuantie", "ling"}) );
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", "一块黑黝黝的令牌，竟是玄铁所铸。\n" );
                set("value", 1);
        }
}

//int is_container() { return 1; }
/*
int query_autoload()
{
        return 1;
}
*/
