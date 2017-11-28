#include <armor.h>
inherit CLOTH;

void create()
{
        set_name("哈萨克袄裙", ({ "ao qun", "qun"}) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "这是一件织著红花绿草的袄裙，哈萨克女孩常穿的衣着。\n");
                set("material", "cloth");
                set("armor_prop/armor", 3);
                set("value", 500);
        }
        setup();
}
