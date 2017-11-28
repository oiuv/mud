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
        set_skill("xiaowuxiang", 600);
        set_skill("beiming-shengong", 600);
        set_skill("dodge", 600);
        set_skill("lingbo-weibu", 600);
        set_skill("feiyan-zoubi", 600);
        set_skill("strike", 600);
        // set_skill("panyang-zhang", 600);
        set_skill("liuyang-zhang", 600);
        set_skill("hand", 600);
        set_skill("qingyun-shou", 600);
        set_skill("zhemei-shou", 600);
        set_skill("parry", 600);
        set_skill("sword", 600);
        set_skill("liuyue-jian", 600);
        set_skill("blade", 600);
        set_skill("ruyi-dao", 600);
        set_skill("literate", 600);
        set_skill("medical", 600);
        set_skill("xiaoyao-qixue", 600);
        set_skill("mathematics", 600);
        set_skill("qimen-wuxing", 600);
        set_skill("drawing",   500);
        set_skill("chuixiao-jifa", 600);
        set_skill("tanqin-jifa", 600);
        set_skill("chess", 600);
        set_skill("calligraphy", 600);
        set_skill("martial-cognize", 600);

        map_skill("force", "beiming-shengong");
        map_skill("dodge", "lingbo-weibu");
        map_skill("hand", "zhemei-shou");
        map_skill("strike", "liuyang-zhang");
        map_skill("parry", "zhemei-jian");
        map_skill("sword", "liuyue-jian");
        map_skill("blade", "ruyi-dao");
        map_skill("medical", "xiaoyao-qixue");

        prepare_skill("hand", "zhemei-shou");
        prepare_skill("strike", "liuyang-zhang");
   
        set("hellzhen", 0);
        setup();

        set_temp("apply/damage", 100); 
        set_temp("apply/unarmed_damage", 100); 
        set_temp("apply/armor", 200); 
                
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/changjian")->wield();
}

void invocation(object target)
{
        object me = this_object();
        int ap, dp, damage;
        string msg;
                
        msg = HIY "$N" HIY "一声清啸，剑法忽变，手中长剑" + HIY
              "轻轻划出，带出一条无比绚丽的剑芒，遥指$n" HIY "而去。\n" NOR;
              
        ap = me->query_skill("sword") * 3 / 2 + me->query_skill("martial-cognize", 1);
        dp = target->query_skill("parry") + target->query_skill("martial-cognize", 1);

        if (ap + random(ap) > dp)
        {
                damage = ap + random(ap);
                me->add("neili", -150);
                
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 45,
                                           HIR "$n" HIR "顿时目瞪口呆，一个不慎，被$N"
                                           HIR "精妙的剑招刺中，鲜血飞溅！\n" NOR);
                me->start_busy(2);
        } else
        {
                me->add("neili", -60);
                
                msg += CYN "可是$p" CYN "并不慌乱，收敛心神，轻轻格挡开了$P"
                       CYN "的剑招。\n" NOR;
                me->start_busy(3);
        }
        message_combatd(msg, me, target);
        destruct(me);
}

