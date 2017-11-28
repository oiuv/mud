//baipao.c
#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name(HIW "白袍" NOR, ({"bai pao", "pao"}) );
        set_weight(2000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "这是件轻纱制成的白色长袍。\n");
                set("material", "silk");
                set("armor_prop/armor", 8);
                set("value",100);
        }
        setup();
}
