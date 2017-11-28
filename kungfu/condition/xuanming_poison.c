#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "xuanming_poison"; }

string chinese_name() { return "玄冥寒毒"; }

string update_msg_others()
{
       return MAG "$N脸色发紫，全身不住的颤抖，牙关格格作响。\n" NOR;
}

string update_msg_self()
{
        return HIW "只感到一股奇寒从体内犹然而升，沁入三焦六脉，看来是玄冥神掌之毒发作了！\n" NOR;
}

int jing_damage(object me, mapping cnd)
{
        return cnd["level"] / 6;
}

int qi_damage(object me, mapping cnd)
{
        return cnd["level"] / 5;
}

int dispel(object me, object ob, mapping cnd)
{

        if ((me->query_skill("jiuyang-shengong", 1) > 180 && 
             me->query_skill_mapped("force") == "jiuyang-shengong") ||
             (me->query_skill("xuanming-shengong", 1) > 180 &&
              me->query_skill_mapped("force") == "xuanming-shengong"))
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