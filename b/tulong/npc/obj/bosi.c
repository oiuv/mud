#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(NOR + MAG "波斯明教教服" NOR, ({ "bosi cloth", "bosi", "cloth" }));
        set_weight(3000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", NOR + MAG "这是一件波斯明教总舵的教服。\n" NOR);
                set("value", 300);
                set("material", "silk");
                set("armor_prop/armor", 2);
        }
        setup();
}

