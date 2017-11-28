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
        set("gender", "女性" );        
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
        set_skill("xiaowuxiang", 600);
        set_skill("beiming-shengong", 600);
        set_skill("blade", 600);
        set_skill("ruyi-dao", 600);
        set_skill("sword", 600);
        set_skill("liuyue-jian", 600);
        set_skill("dodge", 600);
        set_skill("lingbo-weibu", 600);
        set_skill("hand", 600);        
        set_skill("zhemei-shou", 600);
        set_skill("strike", 600);
        set_skill("liuyang-zhang", 600);
        set_skill("parry", 600);
        set_skill("lamaism", 600);
        set_skill("literate", 600);
        set_skill("martial-cognize", 600);

        map_skill("force", "beiming-shengong");
        map_skill("dodge", "lingbo-weibu");
        map_skill("hand", "zhemei-shou");
        map_skill("strike", "liuyang-zhang");
        map_skill("parry", "zhemei-shou");
        map_skill("blade", "ruyi-dao");
        map_skill("sword", "liuyue-jian");

        prepare_skill("strike", "liuyang-zhang");
        prepare_skill("hand", "zhemei-shou");
   
        set("hellzhen", 0);
        setup();

        set_temp("apply/damage", 100); 
        set_temp("apply/unarmed_damage", 100); 
        set_temp("apply/armor", 200); 
                
        carry_object("/clone/cloth/cloth")->wear();
}

void invocation(object target)
{
        object me = this_object();
        int damage;
        string msg;
        int ap, dp, p;
        int lv, cost_neili;


        msg = HIM "$N" HIM "深深吸进一口气，单手挥出，掌缘顿时霞光万道，漾出"
              "七色虹彩向$n" HIM "席卷而至。\n" NOR;

        ap = me->query_skill("hand") + me->query_skill("martial-cognize", 1);
        dp = target->query_skill("dodge") + target->query_skill("martial-cognize", 1);

        if (target->is_bad() || ! userp(target))
                ap += ap / 10;

        if (ap / 2 + random(ap) + random(20) > dp)
        {
                damage = 0;
                lv = me->query_skill("zhemei-shou", 1);
                if (lv >= 220)cost_neili = -500;
                if (lv >= 240)cost_neili = -470;
                if (lv >= 260)cost_neili = -440;
                if (lv >= 280)cost_neili = -400;
                if (lv >= 300)cost_neili = -360;
                if (lv >= 320)cost_neili = -320;
                if (lv >= 340)cost_neili = -300;
                if (lv >= 360)cost_neili = -270;
                if (lv >= 400)cost_neili = -200; 
                if (me->query("max_neili") > target->query("max_neili") * 2)
                {
                        msg += HIM "只听$n" HIM "一声尖啸，$N" HIM "的七色掌"
                               "劲已尽数注入$p" HIM "体内，顿时将$p" HIM "化"
                               "为一滩血水。\n" NOR "( $n" RED "受伤过重，已"
                               "经有如风中残烛，随时都可能断气。" NOR ")\n";
                        damage = ap * 2;
                        me->add("neili", cost_neili);
                        me->start_busy(1);
                } else
                {
                        damage = ap;
                }
                        damage += me->query_temp("apply/unarmed_damage");
                        damage += random(damage);

                        target->receive_damage("qi", damage, me);
                        target->receive_wound("qi", damage / 2, me);
                        target->receive_damage("jing", damage / 4, me);
                        target->receive_wound("jing", damage / 8, me);
                        p = (int)target->query("qi") * 100 / (int)target->query("max_qi");

                        msg += HIM "$n" HIM "只是微微一愣，$N" HIM "的七色掌劲已破体而"
                               "入，$p" HIM "便犹如身置洪炉一般，连呕数口鲜血。\n" NOR;
                        
                        me->add("neili", cost_neili);
                        me->start_busy(3);
        } else
        {
                msg += CYN "$p" CYN "见状大惊失色，完全勘破不透$P"
                       CYN "招中奥秘，当即飞身跃起丈许，躲闪开来。\n" NOR;
                me->add("neili", -200);
                me->start_busy(4);
        }
        message_combatd(msg, me, target);

        destruct(me);
}
