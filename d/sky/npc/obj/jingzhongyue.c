#include <weapon.h>
#include <ansi.h>
inherit BLADE;

void create()
{
        set_name(CYN "井中月" NOR, ({ "jingzhong yue" , "blade" ,"dao", "yue", "jingzhong" }) );
        set_weight(20000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", CYN "一柄四尺来长的单刀，重达百斤，刀身散发着乌黑的光泽。\n" NOR);
                set("value", 100000);
                set("rigidity", 8000);   
                set("material", "steel");
                set("wield_msg", HIY "$N" HIY "一声狂笑，从背后抽出井中月高高举起。\n" NOR);
                set("unwield_msg", HIY "$N" HIY "哈哈一笑，将井中月插回背后。\n"NOR);
        }
        init_blade(200);
        setup();
}
mixed hit_ob(object me, object victim, int damage_bonus)
{
        int pro;
        int dam;
        dam = (int) me->query("str");
        victim->receive_damage("jing", dam);
        return HIY "井中月划出一道炽热的黄芒，$n" HIY "只感到心神俱碎。\n" NOR;
}

