// Copyright (C) 2003, by Lonely. All rights reserved.
// This software can not be used, copied, or modified 
// in any form without the written permission from authors.

#include <ansi.h> 
#include <weapon.h> 
inherit SWORD; 

void create() 
{ 
        set_name(HIW "无间闪电" NOR, ({"wujian shandian", "wujian", "shandian"})); 
        set_weight(15000); 
        if (clonep()) 
                set_default_object(__FILE__); 
        else { 
                set("unit", "把"); 
                set("long", sort_msg(HIR "众神采首山之天石为天帝所铸，对这一把剑还能说些什么呢？"
                                     "天帝！勇气、智慧、仁爱，一切在于两个字：圣道。无间闪电"
                                     "是一把无敌之剑，使用方法：装备后用 smash id 来摧毁对手。\n" NOR));
                set("value", 100000); 
                set("material", "steel");
                set("no_sell", "我的天…你…你知道这是啥么？这你也敢拿来卖？"); 
                set("rigidity", 500); 
                set("no_put",1); 
                set("no_steal",1);   
                set("wield_msg",HIR"$N[噌]的一声抽出一把无间闪电，漫天乌云，电闪雷鸣，杀气四溅。\n"NOR); 
                set("unwield_msg",HIR"$N把手中的无间闪电插入剑鞘，乌云速散，雷电消失，杀气顿无。\n"NOR); 
        }
        init_sword(2100000); 
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        victim->receive_damage("jing", me->query("str") * 200, me);
        victim->receive_wound("jing", me->query("str") * 200, me);
        return HIM "无间闪电夹带着刺耳的破空声划出一道道闪电，霎时间$n"
               HIM "只感到死神来临。\n" NOR;
}

