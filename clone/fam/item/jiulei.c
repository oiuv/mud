#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + HIM "九雷玄音纱" NOR, ({"xuanyin sha", "xuanyin", "sha"}));
        set_weight(10);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIM "薄如蝉翼的纱绸，虽然轻若鸿毛，却是坚韧似铁。\n" NOR);
                set("unit", "张");
                set("value", 9000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + HIM "九雷玄音纱" NOR);
                set("can_make", ({ "护甲", "战衣", "腰带", "护腕", "靴子", "鞭" }));
                set("power_point", 60);
        }
}

int query_autoload()
{
        return 1;
}

