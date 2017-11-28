// freezing.c

#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "freezing"; }

string chinese_name() { return "寒冰真气"; }

string update_msg_others()
{
        return HIW "$N" HIW "脸色铁青，四肢僵硬，全身上下竟笼"
               "罩了一层寒霜。\n" NOR;
}

string update_msg_self()
{
        return HIW "你只觉全身冰冷无比，四肢百骸难受之极，如堕"
               "冰狱。\n" NOR;
}

string die_msg_others()
{
        return HIW "$N" HIW "僵硬的身子在地上扑腾了几下，就再"
               "没半点动静了。\n" NOR;
}

int jing_damage(object me, mapping cnd)
{
        return cnd["level"] / 8;
}

int qi_damage(object me, mapping cnd)
{
        return cnd["level"] / 6;
}

string die_reason()
{
        return "被寒冰真气活活冻死了";
}


int dispel(object me, object ob, mapping cnd)
{
        if ((me->query_skill("jiuyang-shengong", 1) > 180 && 
             me->query_skill_mapped("force") == "jiuyang-shengong") ||
             (me->query_skill("hanbing-zhenqi", 1) > 180 &&
              me->query_skill_mapped("force") == "hanbing-zhenqi") || 
             (me->query_skill("zixia-shengong", 1) > 180 &&
              me->query_skill_mapped("force") == "zixia-shengong"))
        {
               me->add_temp("apply/dispel-poison", 1000);
               me->set_temp("add_dispel", 1); 
               call_out("clear_dispel", 2, me);
        }

        return ::dispel(me, ob, cnd);

}


void clear_dispel(object me)
{
       if (me->query_temp("apply/dispel-poison") && 
           me->query_temp("add_dispel"))
       {
                me->delete_temp("add_dispel");
                me->add_temp("apply/dispel-poison", -1000);
                return;
       }
               
}