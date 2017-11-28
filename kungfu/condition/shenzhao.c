#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "shenzhao"; }

string chinese_name() { return "神照经内劲"; }

string update_msg_others()
{
       return HIR "只见$N" HIR "呛呛退了数步，身子摇晃，双"
              "腿渐渐弯曲，似乎喝醉了一般。\n" NOR;
}

string update_msg_self()
{
        return HIW "你只感内息顿滞，真气不畅，一张脸涨得通"
               "红，便要跌倒。\n" NOR;
}

int jing_damage(object me, mapping cnd)
{
        return cnd["level"] / 8;
}

int qi_damage(object me, mapping cnd)
{
        return cnd["level"] / 4;
}
