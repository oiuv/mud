

#include <ansi.h>

inherit F_CLEAN_UP;

int is_scborn() { return 1; }

string name() { return HIG "天道酬勤" NOR; }

int perform(object me, string skill)
{
        if (me->query("int") < 26 && me->query_skill("zuoyou-hubo", 1) < 360)
                me->set_skill("zuoyou-hubo", 360);

        return notify_fail("你没有过人的才智，但终你一生你都勤恳奋斗，诚\n"
                           "意感天动地，天道特赐你此等神技。此特技使用后\n"                          
                           "可得到左右互搏三百六十级。注意：此特技在你先\n"
                           "天悟性大于二十五点后无法继续使用！\n");
}
