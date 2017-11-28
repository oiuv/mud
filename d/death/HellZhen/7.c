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
        set("combat_exp", 640000000+random(600000000));
        set("level", 99);
        set("max_qi", 12000000);
        set("max_jing", 1200000);
        set("neili", 8000000);
        set("max_neili", 8000000);
        set("jingli", 8000000);
        set("max_jingli", 8000000);
        
        set_skill("force", 600);
        set_skill("huntian-qigong", 600);
        set_skill("yijin-duangu", 600);
        set_skill("blade", 600);
        set_skill("liuhe-dao", 600);
        set_skill("staff", 600);
        set_skill("dagou-bang", 600);
        set_skill("dodge", 600);
        set_skill("xiaoyaoyou", 600);
        set_skill("hand", 600);        
        set_skill("strike", 600);
        set_skill("xianglong-zhang", 600);
        set_skill("parry", 600);
        set_skill("checking", 600);
        set_skill("literate", 600);
        set_skill("martial-cognize", 600);

        map_skill("force", "huntian-qigong");
        map_skill("dodge", "xiaoyaoyou");
        map_skill("strike", "xianglong-zhang");
        map_skill("parry", "xianglong-zhang");
        map_skill("blade", "liuhe-dao");
        map_skill("staff", "dagou-bang");

        prepare_skill("strike", "xianglong-zhang");
   
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
        int ap, dp;


        // 第一掌
        ap = me->query_skill("strike") * 3 / 2 + me->query_skill("martial-cognize", 1);
        dp = target->query_skill("dodge") + target->query_skill("martial-cognize", 1);

        message_sort(HIW "\n忽然间$N" HIW "身形激进，左手一划，右手呼的一掌，便"
                     "向$n" HIW "击去，正是降龙十八掌「" NOR + HIY "亢龙有悔" NOR
                     + HIW "」一招，力自掌生之际说到便到，以排山倒海之势向$n" HIW
                     "狂涌而去，当真石破天惊，威力无比。\n" NOR, me, target);
        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap);
                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 40,
                                          HIR "$p" HIR "一楞，只见$P" HIR "身形"
                                          "一闪，已晃至自己跟前，躲闪不及，被击"
                                          "个正中。\n:内伤@?");

                message_vision(msg, me, target);

        } else
        {
                msg = HIC "$p" HIC "气贯双臂，凝神应对，游刃有余，$P"
                      HIC "掌力如泥牛入海，尽数卸去。\n" NOR;
                message_vision(msg, me, target);
        }

        // 第二掌
        ap = me->query_skill("strike") * 3 / 2 + me->query("str") * 5 +
             me->query("level") * 20;
        dp = target->query_skill("parry") + target->query("dex") * 5 +
             target->query("level") * 20;

        message_sort(HIW "\n$N" HIW "一掌既出，身子已然抢到离$n" HIW "三四丈之外"
                     "，后掌推前掌，两股掌力道合并，又是一招「" NOR + HIY "亢龙有"
                     "悔" NOR + HIW "」攻出，掌力犹如怒潮狂涌，势不可当。霎时$n"
                     HIW "便觉气息窒滞，立足不稳。\n" NOR, me, target);
        if (ap / 2 + random(ap) > dp)
        {
                damage = ap * 2 / 3 + random(ap);
                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 50,
                                           HIR "只听$p" HIR "一声惨嚎，被$P" HIR
                                           "一掌击中胸前，“喀嚓喀嚓”断了几根肋"
                                           "骨。\n:内伤@?");

                message_vision(msg, me, target);
        } else
        {
                msg = HIC "$p" HIC "气贯双臂，凝神应对，游刃有余，$P"
                      HIC "掌力如泥牛入海，尽数卸去。\n" NOR;
                message_vision(msg, me, target);
        }

        // 第三掌
        ap = me->query_skill("strike") * 3 + me->query("str") * 5 +
             me->query_skill("martial-cognize", 1);
        dp = target->query_skill("force") + target->query("con") * 5 +
             target->query_skill("martial-cognize", 1);

        message_sort(HIW "\n紧跟着$N" HIW "一声暴喝，右掌斜斜挥出，前招掌力未消"
                     "，此招掌力又到，竟然又攻出一招「" NOR + HIY "亢龙有悔" NOR
                     + HIW "」，掌夹风势，势如破竹，便如一堵无形气墙，向前疾冲而"
                     "去。$n" HIW "只觉气血翻涌，气息沉浊。\n" NOR, me, target);

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 60,
                                           HIR "结果$p" HIR "躲闪不及，$P" HIR
                                           "的掌劲顿时穿胸而过，“哇”的喷出一大"
                                           "口鲜血。\n:内伤@?");

                message_vision(msg, me, target);
                me->start_busy(3 + random(4));
                me->add("neili", -400 - random(600));
        } else
        {
                msg = HIC "$p" HIC "见这招来势凶猛，身形疾退，瞬间飘出三"
                      "丈，脱出$P" HIC "掌力之外。\n" NOR;
                message_vision(msg, me, target);
                me->start_busy(3 + random(4));
                me->add("neili", -400 - random(600));
        }
        message_combatd(msg, me, target);
        destruct(me);
}
