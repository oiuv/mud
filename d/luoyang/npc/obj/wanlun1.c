#include <ansi.h>
#include <armor.h>

inherit WRISTS;

void create()
{
        set_name(HIY "绞金腕轮" NOR, ({ "jiaojin wanlun", "wanlun"}) );
        set_weight(20000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "对");
                set("value", 220000);
                set("material", "leather");
                set("armor_prop/armor", 60);
        }
        setup();
}

void owner_is_killed()
{
        destruct(this_object());
} 
