/*

在相应的 perform 文件里加上：

#include "/kungfu/skill/eff_msg.h";

        int p;

        p = (int)target->query("qi") * 100 / (int)target->query("max_qi");

        msg += "( $n" + eff_status_msg(p) + " )\n";
*/

string eff_status_msg(int ratio)
{
        if (ratio==100) return HIG "看起来充满活力，一点也不累。" NOR;
        if (ratio > 95) return HIG "似乎有些疲惫，但是仍然十分有活力。" NOR;
        if (ratio > 90) return HIY "看起来可能有些累了。" NOR;
        if (ratio > 80) return HIY "动作似乎有点不太灵光，但仍然有条不紊。" NOR;
        if (ratio > 65) return HIY "气喘嘘嘘，看起来状况并不太好。" NOR;
        if (ratio > 50) return HIR "似乎十分疲惫，看来需要好好休息了。" NOR;
        if (ratio > 40) return HIR "招架已然散乱，正勉力支撑著不倒下去。" NOR;
        if (ratio > 30) return HIR "看起来已经力不从心了。" NOR;
        if (ratio > 15) return RED "歪歪斜斜地站都站立不稳，眼看就要倒地。" NOR;
        return RED "已经陷入半昏迷状态，随时都可能摔倒晕去。" NOR;
}
