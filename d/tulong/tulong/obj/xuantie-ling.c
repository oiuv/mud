#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(CYN "ĞşÌúÁî" NOR, ({ "xuantie ling", "xuantie", "ling"}) );
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "Ö»");
                set("long", "Ò»¿éºÚ÷î÷îµÄÁîÅÆ£¬¾¹ÊÇĞşÌúËùÖı¡£\n" );
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
