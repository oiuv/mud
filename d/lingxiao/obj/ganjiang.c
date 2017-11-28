//LUCAS 2000-6-18
// ganjiang.c 
#include <weapon.h>
#include <ansi.h>
inherit SWORD;

void create()
{
        set_name( HIC "干将" NOR , ({ "ganjiang", "jian" }));
        set_weight(8000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "这就是赫赫有名的干将,剑锋上隐隐透出一股清气,仔细凝望,只觉一股肃杀之气森热煌馍ⅰn");
                set("value", 20000);
                set("material", "steel");
                set("weapon_prop/personality", 8);
                set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中,顿时风沙飞扬,黑云罩日,漫天神鬼惊惧。\n");
                set("unwield_msg", "$N将手中的$n插回剑鞘,一下子风平浪静,晴空万里。\n");
        }
        init_sword(100);
        setup();
}

