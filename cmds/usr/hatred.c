#include <ansi.h>

inherit F_CLEAN_UP;

// 为所有的仇恨对象排序：降序
int sort_hatred(string id1, string id2, mapping hatred)
{
        mixed *d1, *d2;

        if (! arrayp(d1 = hatred[id1]) || sizeof(d1) < 2 || ! intp(d1[1]))
                return 1;

        if (! arrayp(d2 = hatred[id2]) || sizeof(d2) < 2 || ! intp(d2[1]))
                return -1;

        return d2[1] - d1[1];
}

int main(object me, string arg)
{
        object ob;
        mapping hatred;
        string fam;
        string *ids;
        mixed *data;
        string msg;
        string st;
        int count;
        int i;

        if (! wizardp(me))
                // only wizard can show every family's list
                fam = 0;
        else
        if (stringp(arg))
        {
                fam = FAMILY_D->query_family_name(arg);
                if (strlen(fam) < 2 || fam[0] < 160)
                        // 如果不是中文名字，则意味着没有还确定门派
                        fam = 0;

                if (! stringp(fam) && objectp(ob = find_player(arg)))
                {
                        // 没有 arg 这个门派，查看是否有该玩家
                        fam = ob->query("family/family_name");
                        if (! stringp(fam))
                                return notify_fail(ob->name(1) +
                                                   "现在没有加入任何门派。\n");
                }

                if (! stringp(fam))
                        return notify_fail("没有这个玩家，不能查阅相关的门派。\n");
        }

        if (! fam)
        {
                // select my family
                if (! stringp(fam = me->query("family/family_name")))
                        return notify_fail("你现在还没有加入一个门派呢。\n");
        }

        hatred = FAMILY_D->query_family_hatred(fam);
        if (! mapp(hatred) || ! sizeof(hatred))
                return notify_fail(fam + "现在没有什么仇人。\n");

        ids = keys(hatred) - ({ 0 });
        ids = sort_array(ids, (: sort_hatred :), hatred);

        count = 0;
        msg = WHT "目前" + fam + "在江湖上的仇敌都有\n" NOR
              HIY "────────────────\n" NOR;
        for (i = 0; i < sizeof(ids) && count < 30; i++)
        {
                data = hatred[ids[i]];
                if (! arrayp(data) || sizeof(data) < 2 ||
                    ! stringp(data[0]) || ! intp(data[1]))
                        continue;

                st = sprintf("%s(%s%s%s)", data[0], YEL, ids[i], NOR);
                msg += sprintf("%2d. %-34s  %s%-9d%s\n",
                               ++count, st, HIR, data[1], NOR);
        }

        msg += HIY "────────────────\n" NOR;
        if (i < sizeof(ids))
                msg += WHT "江湖上的敌人太多，难以尽数。\n" NOR;
        else
                msg += WHT "目前一共是" + chinese_number(i) +
                       "人。\n" NOR;
        write(msg);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式: hatred

查看目前你所处的门派的痛恨对象。巫师可以查看任何门派的痛恨对
象，只需在指令中指明相关的门派或是门派中的玩家。
HELP );
        return 1;
}
