#include "herb.h"

void create()
{
        set_name(HIW "Ñ©Á«" NOR, ({ "xue lian", "xue", "lian", "herb_xuelian" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "Ñ©Á«ÊÇÆÄÎªÃû¹óµÄÖÐÒ©Ò©²Ä¡£\n" NOR);
                set("base_unit", "¶ä");
                set("base_value", 30000);
                set("base_weight", 40);
        }
        setup();
}
