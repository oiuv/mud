#include <armor.h>
#include <ansi.h>

inherit CLOTH;
inherit F_NOCLONE;

void create()
{
    	set_name(NOR + YEL "飞驼金甲" NOR, ({ "feituo jinjia", "feituo", "jinjia", "armor", "jia", }) );
        set_weight(10000);
        set("unit", "副");
      	set("long", YEL "这是一副用黄金打造而成的护甲，甲上雕刻着背生翅\n"
                    "膀的骆驼。传说中只有高昌国王才可使用飞驼标记。\n" NOR);
        set("material", "cloth");
        set("value",1000000);
        set("no_sell", 1);
        set("armor_prop/dodge", -30);
        set("armor_prop/armor", 200);
        set("stable", 0);
        setup();
        check_clone();
}
