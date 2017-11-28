// zhanyi.c
#include <armor.h>
inherit CLOTH;
void create()
{
        set_name("血棋衣", ({ "xue yi","yi","cloth" }));
        set_weight(600);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "一件上面绣有血色棋局的衣服。\n");
                set("value", 7000);
                set("material", "cloth");
                set("skill", ([
                        "name":        "finger",
                        "exp_required": 10000,
                        "jing_cost":    20,
                        "difficulty":   20,
                        "max_skill":    119,
                ]) );
                set("armor_prop/armor",20);
        }
        setup();
}
