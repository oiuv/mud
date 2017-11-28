// status.c
// updated by doing

#include <localtime.h>

inherit F_CLEAN_UP;

int help(object me);

int filter_for_heart_beat(object ob);

int main(object me, string arg)
{
        object ob;
        object *obs;
        string msg;
        mixed lt;
        mapping st;
        string bn;
        string *ks;
        int i;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

        seteuid(getuid());

        lt = localtime(time());
        msg = sprintf("%d/%d/%d  %d:%d:%d\n",
                      lt[LT_YEAR], lt[LT_MON] + 1, lt[LT_MDAY],
                      lt[LT_HOUR], lt[LT_MIN], lt[LT_SEC]);
        if (arg == "object")
        {
                st = ([]);
                obs = objects();
                i = 0;
                foreach (ob in obs)
                {
                        bn = file_name(ob);
                        sscanf(bn, "%s#%*d", bn);
                        if (! st[bn]) st[bn] = 1; else st[bn]++;
                        if (i++ > 10000)
                        {
                                reset_eval_cost();
                                i = 0;
                        }
                }

                // 选出复制超过 50 个的物品
                reset_eval_cost();
                ks = keys(st);
                ks = filter_array(ks, (: $(st)[$1] >= 50 :));

                // 排序
                reset_eval_cost();
                ks = sort_array(ks, (: $(st)[$2] - $(st)[$1] :));

                // 选择前100个
                msg += "目前系统中复制对象超过 50 个的物品如下：\n";
                for (i = 0; i < sizeof(ks) && i < 100; i++)
                        msg += sprintf("%3d. %-40s %d\n",
                                       i + 1, ks[i], st[ks[i]]);
                me->start_more(msg);
                return 1;
        }

        obs = filter_array(objects(), (: filter_for_heart_beat :));
        msg += (string)mud_status(arg == "detail" ? 1 : 0);
        msg += sprintf("Object with heart beating: %d\n", sizeof(obs));
        if (arg == "detail")
                msg += sprintf("%O\n", obs);
        me->start_more(msg);

        return 1;

}

int filter_for_heart_beat(object ob)
{
        return query_heart_beat(ob);
}

int help(object me)
{
        write(@HELP
指令格式 : status [detail | object]

利用此指令可得知有关系统的信息。
HELP );
        return 1;
}

