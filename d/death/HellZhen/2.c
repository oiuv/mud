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
        set_skill("mizong-neigong", 600);
        set_skill("xuehai-mogong", 600);
        set_skill("blade", 600);
        set_skill("xuedao-dafa", 600);
        set_skill("sword", 600);
        set_skill("mingwang-jian", 600);
        set_skill("dodge", 600);
        set_skill("shenkong-xing", 600);
        set_skill("hand", 600);        
        set_skill("dashou-yin", 600);
        set_skill("cuff", 600);
        set_skill("yujiamu-quan", 600);
        set_skill("parry", 600);
        set_skill("lamaism", 600);
        set_skill("literate", 600);
        set_skill("martial-cognize", 600);

        map_skill("force", "xuehai-mogong");
        map_skill("dodge", "shenkong-xing");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");
        map_skill("parry", "xuedao-dafa");
        map_skill("blade", "xuedao-dafa");
        map_skill("sword", "mingwang-jian");

        prepare_skill("cuff", "yujiamu-quan");
        prepare_skill("hand", "dashou-yin");
   
        set("hellzhen", 0);
        setup();

        set_temp("apply/damage", 100); 
        set_temp("apply/unarmed_damage", 100); 
        set_temp("apply/armor", 200); 
                
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/blade")->wield();
}

void invocation(object target)
{
        object me = this_object();
        int ap, dp, damage;
        string msg;
                
        ap = me->query_skill("blade") * 3 / 2 + me->query_skill("martial-cognize", 1);
        dp = target->query_skill("dodge") + target->query_skill("martial-cognize", 1);
             
        msg = HIY "$N" HIY "陡然施出「" HIR "噬血穹苍" HIY "」，手中钢刀"
              HIY "腾起无边杀意，携着风雷之势向$n" HIY "劈斩而去！\n" NOR;

        if (ap + random(ap) > dp)
        {
                damage = ap / 2 + random(ap);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 75,
                                           HIR "$n" HIR "只觉眼前一蓬血雨喷洒而出"
                                           "，已被$N" HIR "这一刀劈了个正中。\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "只见$P" CYN "来势汹涌，难以抵挡，当"
                       "即飞身朝后跃出数尺。\n" NOR;
        }
        message_combatd(msg, me, target);            
        destruct(me);
}

