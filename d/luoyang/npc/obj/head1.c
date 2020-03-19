#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
        set_name(HIY "琉金盔" NOR, ({ "liujin kui", "kui"}) );
        set_weight(20000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("value", 250000);
                set("material", "leather");
                set("armor_prop/armor", 80);
        }
        setup();
}

void owner_is_killed()
{
        destruct(this_object());
} 
