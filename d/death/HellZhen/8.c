// Copyright (C) 2003-2004, by Lonely. All rights reserved.
// This software can not be used, copied, or modified 
// in any form without the written permission from authors.

inherit NPC;

#include <ansi.h>
#include <combat.h>
#include "ghost.h" 

void create()
{
        string name;
        name = first_name[random(sizeof(first_name))];
        name += name_words[random(sizeof(name_words))];
        name += last_words[random(sizeof(last_words))];
        
        set_name(name, ({ "ghost"}) );
        set("gender", "男性" );        
        set("age",40);
        set("str", 30);
        set("int", 20);
        set("per", 27);
        set("attitude", "killer");
        set("combat_exp", 60000000 + random(30000000));
        set("level", 99);
        set("max_qi", 12000000);
        set("max_jing", 1200000);
        set("neili", 8000000);
        set("max_neili", 8000000);
        set("jingli", 8000000);
        set("max_jingli", 8000000);
        
        set_skill("force", 600);
        set_skill("xiantian-gong", 600);
        set_skill("quanzhen-xinfa", 600);
        set_skill("finger", 600);
        set_skill("zhongnan-zhi", 600);
        set_skill("sword", 600);
        set_skill("quanzhen-jian", 600);
        set_skill("dodge", 600);
        set_skill("jinyan-gong", 600);
        set_skill("unarmed", 600);        
        set_skill("parry", 600);
        set_skill("taoism", 600);
        set_skill("literate", 600);
        set_skill("martial-cognize", 600);

        map_skill("force", "xiantian-gong");
        map_skill("dodge", "shenkong-xing");
        map_skill("finger", "zhongnan-zhi");
        map_skill("unarmed", "xiantian-gong");
        map_skill("parry", "xiantian-gong");
        map_skill("sword", "quanzhen-jian");

        prepare_skill("unarmed", "xiantian-gong");
   
        set("hellzhen", 0);
        setup();

        set_temp("apply/damage", 100); 
        set_temp("apply/unarmed_damage", 100); 
        set_temp("apply/armor", 200); 
                
        carry_object("/clone/cloth/cloth")->wear();
}

void invocation(object target)
{
        object weapon, cloth;
        int ap, dp, damage, wp, cl;
        string msg;
        object me = this_object();


        msg = HIW "只见$N" HIW "双目精光四射，双掌陡然一振，将体内积蓄的"
              "先天真气云贯推出，顿时呼啸\n声大作，先天劲道层层叠叠，宛如"
              "涛浪般涌向$n" HIW "。\n" NOR;

        ap = me->query_skill("unarmed") * 3 / 2 + me->query_skill("martial-cognize", 1);
        dp = target->query_skill("force") + target->query_skill("martial-cognize", 1);

        if (ap * 3 / 2 + random(ap) > dp)
        {
                damage = 0;
                        me->start_busy(4);
                        damage = ap + random(ap / 2);
                        me->add("neili", -400);
                        msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK,
                                                   damage, 90, HIR "$N" HIR "的"
                                                   "罡劲登时瓦解了$n" HIR "的护"
                                                   "体真气，$p" HIR "真元受损，"
                                                   "接连喷出数口鲜血。\n" NOR);

                        if (objectp(weapon = target->query_temp("weapon"))
                           && weapon->query("stable", 1) < 100
                           && ap / 3 + random(ap) > dp)
                        {
                                wp = weapon->name();
                                msg += HIW "只听“锵”的一声脆响，$n" HIW "手"
                                       "中的" + wp + HIW "在$N" HIW "内力激荡"
                                       "下应声而碎，脱手跌落在地上。\n" NOR;
                                me->add("neili", -150);
                                weapon->set("consistence", 0);
                                weapon->move(environment(target));
                        } else

                        if (objectp(cloth = target->query_temp("armor/armor"))
                           && cloth->query("stable", 1) < 100
                           && ap / 3 + random(ap) > dp)
                        {
                                cl = cloth->name();
                                msg += HIW "只听“轰”的一声闷响，$n" HIW "身"
                                       "着的" + cl + HIW "在$N" HIW "内力激荡"
                                       "下应声而裂，化成一块块碎片。\n" NOR;
                                me->add("neili", -150);
                                cloth->set("consistence", 0);
                                cloth->move(environment(target));
                        } else

                        if (objectp(cloth = target->query_temp("armor/cloth"))
                           && cloth->query("stable", 1) < 100
                           && ap / 3 + random(ap) > dp)
                        {
                                cl = cloth->name();
                                msg += HIW "只听“轰”的一声闷响，$n" HIW "身"
                                       "着的" + cl + HIW "在$N" HIW "内力激荡"
                                       "下应声而碎，化成一块块碎片。\n" NOR;
                                me->add("neili", -150);
                                cloth->set("consistence", 0);
                                cloth->move(environment(target));
                        }
        } else
        {
                me->start_busy(4);
                me->add("neili", -120);
                msg += CYN "可是$p" CYN "知道$P" CYN "这招的厉"
                       "害，不敢硬接，当即斜跃躲避开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        destruct(me);
}
