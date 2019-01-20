#include <weapon.h>
#include <ansi.h>
inherit SWORD;
void create()
{
        set_name(CYN "倚天剑" NOR, ({ "yitian sword", "jian", "sword" }) );
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", HIY "这便与天下至尊的屠龙宝刀并称的倚天剑。\n相传让刀剑对砍(duikan)可以得到旷世的武林秘籍。\n" NOR);
                set("value", 100000);
                set("no_sell", "这样东西不能卖。\n");
                set("rigidity",8000);   
                set("material", "steel");
                set("wield_msg", HIW "只听“嗖”的一声破空声响，号称天下第一神兵的倚天剑已被$N握在手中。\n" NOR);
                set("unwield_msg", HIW "$N将倚天剑插回腰间，天地又渐渐放出光芒。\n"NOR);
        }
        init_sword(500);
        setup();
}
mixed hit_ob(object me, object victim, int damage_bonus)
{
//      int pro;
        int dam;
        dam = (int) me->query("dex");
        victim->add("neili", -dam * 10);

        if (victim->query("neili") < 0) 
        victim->set("neili", 0); 

        return HIW "倚天剑携着飕飕刺骨风声，直直刺向$n，$n只感到全身的内力竟一丝丝随着剑锋涌出。\n" NOR;
}
