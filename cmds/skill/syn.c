// 融合

inherit F_CLEAN_UP;
#include <ansi.h>

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object item;
        string msg;

        if (! arg) return notify_fail("你要与什么物品融合？\n");

        if (! objectp(item = present(arg, me)))
                return notify_fail("你身上没有这种物品。\n");

        if (! stringp(item->query("magic/type")) ||
            ! stringp(item->query("magic/tessera")))
                return notify_fail("这个物品还没有成为圣物，无法与之融合！\n");
     
        if (item->item_owner() != me->query("id"))
                return notify_fail("你不是它的主人，无法与之融合！\n");

        if (item->query("magic/blood") >= 5)
                return notify_fail("你已经与之完全融合了！\n");

        if (me->query("neili") < me->query("max_neili") * 9 / 10)
                return notify_fail("你现在内力并不充沛，怎敢贸然与之融合？\n");

        if (me->query("jingli") < me->query("max_jingli") * 9 / 10)
                return notify_fail("你现在精力不济，无法与之融合！\n");

        if (me->query("qi") < me->query("max_qi") * 9 / 10 ||
            me->query("max_qi") < 5000)
                return notify_fail("你现在气血不足，无法与之融合！\n");

        message_sort(HIM "\n$N" HIM "长叹一声，凝视着自己心爱的" + item->name() + HIM
                     "，只见一道白光闪过，$N" HIM "的鲜血已洒在" + item->name() + HIM
                     "上，霎那间，天地失色，日月无光，鲜血慢慢地被" + item->name() + HIM
                     "吸收。渐渐地，$N" HIM "已与其融合为一体！\n" NOR, me, item);

        msg = HIG "通过这次融合，你与" + item->name() + HIG "的\n" NOR;
        msg += HIG "融合度提升 1 。\n" NOR;
        msg += HIG "魔法力改善 10 。\n" NOR;
        msg += HIR "你感到自己的气血、内力、精力下降了。\n" NOR;
 
        item->add("magic/blood", 1);
        item->add("magic/power", 10);
        item->save();
        me->add("max_qi", -400);
        me->add("qi", -800);
        me->add("max_neili", -100);
        me->add("neili", -300);
        me->add("max_jingli", -100);
        me->add("jingli", -300);

        if (item->query("magic/blood") >= 5)
               msg += HIG "你感到自己已经和" + item->name() + HIG "完全融合了！\n\n";
      
        else msg += "\n";
        
        tell_object(me, msg);


        return 1;

}

int help(object me)
{
write(@HELP
指令格式 : syn <物品名称>
 
这个指令可以让你与自己的兵器融合。一件兵器最多融合五次，每次
融合后可以提升十点兵器的魔法力和一点融合度。融合度达到三以后
才能追寻物品。但是每次融合需要损失大量的气血上限和少量的内力、
精力上限。慎重使用！

HELP
);
    return 1;
}
