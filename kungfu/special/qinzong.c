

#include <ansi.h>

inherit F_CLEAN_UP;

int is_scborn() { return 1; }

string name() { return HIM "循影擒踪" NOR; }

int perform(object me, string skill)
{
        if (me->query_skill("count", 1) < 300)
                me->set_skill("count", 300);

        if (me->query_skill("mathematics", 1) < 300)
                me->set_skill("mathematics", 300);

        return notify_fail("你在转生过程中纵观天象，察觉到了人世间的诸多\n"
                           "奥秘，众生百态尽收眼底，此后不再受到拆招卸力\n"                          
                           "之技的迷惑。使用后可得到阴阳八卦及算术三百级。\n"
                           );
}
