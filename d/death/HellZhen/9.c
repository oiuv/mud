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
        set_skill("unarmed", 600);
        set_skill("dodge",500);
        set_skill("parry", 600);
        set_skill("cuff", 600);
        set_skill("finger", 600);
        set_skill("staff", 600);
        set_skill("training", 600);
        set_skill("poison", 600);
        set_skill("shedu-qiqiao", 600);
        set_skill("hamagong", 600);
        set_skill("chanchu-bufa", 600);
        set_skill("lingshe-quan", 600);
        set_skill("lingshe-zhangfa", 600);
        set_skill("baibian-daxue", 600);
        set_skill("guzheng-jifa", 600);
        set_skill("xiyu-tiezheng", 600);
        set_skill("wushe-qu", 600);
        set_skill("literate", 600);
        set_skill("martial-cognize", 600);


        map_skill("force", "hamagong");
        map_skill("dodge", "chanchu-bufa");
        map_skill("cuff", "lingshe-quan");
        map_skill("parry", "lingshe-zhangfa");
        map_skill("staff", "lingshe-zhangfa");
        map_skill("unarmed", "hamagong");
        map_skill("finger", "shedu-qiqiao");
        map_skill("poison", "shedu-qiqiao");
        map_skill("medical", "baituo-michuan");
        map_skill("guzheng-jifa", "xiyu-tiezheng");

        prepare_skill("unarmed", "hamagong");
   
        set("hellzhen", 0);
        setup();

        set_temp("apply/damage", 100); 
        set_temp("apply/unarmed_damage", 100); 
        set_temp("apply/armor", 200); 
                
        carry_object("/clone/cloth/cloth")->wear();
}

void invocation(object target)
{
        int damage, p, ap, dp;
        string msg, dodge_skill;
        object me = this_object();
        
        msg = BLU "\n$N身子蹲下，左掌平推而出，使的正是$N生平最得意的「蛤蟆功」绝招，掌风直逼$n而去！\n"NOR;        
        me->set_temp("hmg_hama", 1);
        
        ap = me->query_skill("force") * 3 / 2 +  
             me->query_skill("martial-cognize", 1); 

        dp = target->query_skill("force") +
             target->query_skill("martial-cognize", 1); 

        if (ap * 2 + random(ap) > dp)
        {                
                me->start_busy(1);
                target->start_busy(1); 
                me->add("neili", -200);
                damage = (int)me->query_skill("hamagong", 1) * 2;     
                damage = damage + random(damage);
                if(me->query("neili") > target->query("neili")*2 ) 
                        damage += random(damage);
                target->receive_damage("qi", damage, me);
                target->receive_wound("qi", damage/2, me);
                msg += COMBAT_D->damage_msg(damage, "内伤");
                call_out("perform2", 0, me, target, p);    
        } else 
        {
                me->start_busy(2);
                target->start_busy(1);
                me->add("neili", -100);
                tell_object(target, HIY"你但觉一股微风扑面而来，风势虽然不劲，然已逼得自己呼吸不畅，知道不妙，连忙跃开数尺。\n" NOR);
                dodge_skill = target->query_skill_mapped("dodge");
                if( !dodge_skill ) dodge_skill = "dodge";
                msg += SKILL_D(dodge_skill)->query_dodge_msg(target, 1);
                call_out("remove_effect", me->query_con()/6, me);
        }
        message_combatd(msg, me, target); 
}

int perform2(object me, object target, int p)
{
        int damage, ap, dp;
        string msg, dodge_skill;


        msg = BLU "\n$N左掌劲力未消，右掌也跟着推出，功力相叠，「蛤蟆功」掌风排山倒海般涌向$n！\n"NOR;   
             
        ap = me->query_skill("force") * 3 / 2 +  
             me->query_skill("martial-cognize", 1); 

        dp = target->query_skill("dodge") +
             target->query_skill("martial-cognize", 1); 

        if (ap * 2 + random(ap) > dp)   
        {     
                me->add("neili", -300);           
                damage = (int)me->query_skill("hamagong", 1) * 2;     
                damage = damage + random(damage);
                if(me->query("neili") > target->query("neili")*2 ) 
                        damage += random(damage);
                target->receive_damage("qi", damage, me);
                target->receive_wound("qi", damage/2, me);
                msg += COMBAT_D->damage_msg(damage, "内伤");       
                call_out("perform3", 0, me, target, p);  
        } 
        else 
        {
                me->start_busy(4);
                me->add("neili", -200);
                tell_object(target, HIY"你喘息未定，又觉一股劲风扑面而来，连忙跃开数尺，狼狈地避开。\n" NOR);
                dodge_skill = target->query_skill_mapped("dodge");
                if( !dodge_skill ) dodge_skill = "dodge";
                msg += SKILL_D(dodge_skill)->query_dodge_msg(target, 1);
                call_out("remove_effect", me->query_con()/4, me);
        }
        message_vision(msg, me, target); 
}

int perform3(object me, object target, int p)
{
        int damage, ap, dp;
        string msg, dodge_skill;
  

        msg = BLU "\n$N双腿一登，双掌相并向前猛力推出，$n连同身前方圆三丈全在「蛤蟆功」劲力笼罩之下！\n"NOR;   
             
        ap = me->query_skill("force") * 3 / 2 +  
             me->query_skill("martial-cognize", 1); 

        dp = target->query_skill("parry") +
             target->query_skill("martial-cognize", 1); 

        if (ap * 2 + random(ap) > dp)  
        {
                me->add("neili", -400);          
                damage = (int)me->query_skill("hamagong", 1) * 2;     
                damage = damage + random(damage);
                if(me->query("neili") > target->query("neili")*2 ) damage += random(damage);
                target->receive_damage("qi", damage, me);
                target->receive_wound("qi", damage/2, me);
                msg += COMBAT_D->damage_msg(damage, "瘀伤");
        } else 
        {
                me->add("neili", -300);
                target->add("jingli", -100);
                tell_object(target, HIY"你用尽全身力量向右一纵一滚，摇摇欲倒地站了起来，但总算躲开了这致命的一击！\n" NOR);
                dodge_skill = target->query_skill_mapped("dodge");
                if( !dodge_skill ) dodge_skill = "dodge";
                msg += SKILL_D(dodge_skill)->query_dodge_msg(target, 1);
        }
        call_out("remove_effect", me->query_con()/2, me);
        message_combatd(msg, me, target); 
        destruct(me);
}


