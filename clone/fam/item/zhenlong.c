#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + CYN "镇龙石" NOR, ({"zhenlong shi", "zhenlong", "shi"}));
        set_weight(8000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", CYN "传说此石乃是历代皇朝用于镇住龙脉所用，大非寻常。\n" NOR);
                set("unit", "块");
                set("value", 9000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + CYN "镇龙石" NOR);
                set("can_make", ({ "剑", "刀", "锤", "短兵", "箫", "棍", "杖" }));
                set("power_point", 60);
        }
}

int query_autoload()
{
        return 1;
}

