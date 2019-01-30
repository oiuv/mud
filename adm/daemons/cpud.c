// cpud.c

// #pragma optimize
// #pragma save_binary

inherit F_DBASE;

#include <ansi.h>

int clean_up() { return 1; }

#define CHECK_PERIOD    100     // 100s检查一次
#define EXPECTATION     50      // 希望心跳50次

#define check_period    my["check_period"]
#define expectation     my["expectation"]
#define counter         my["counter"]
#define last_check      my["last_check"]
#define last_rusage     my["last_rusage"]
#define last_0          my["last_0"]
#define last_1          my["last_1"]
#define last_2          my["last_2"]
#define last_3          my["last_3"]
#define last_4          my["last_4"]

void create()
{
        mapping my;

        seteuid(getuid());
        set("channel_id", "系统精灵");
        CHANNEL_D->do_channel(this_object(), "sys", "系统精灵已经启动。");
        set_heart_beat(1);

        // 初始化扫描时间
        my = query_entire_dbase();
        if (CONFIG_D->query_int("cpu_check_period") < 2)
        {
                check_period = CHECK_PERIOD;
                expectation = EXPECTATION;
        } else
        {
                check_period = CONFIG_D->query_int("cpu_check_period");
                if (CONFIG_D->query_int("cpu_expectation") < 1)
                        expectation = check_period / 2;
                else
                        expectation = CONFIG_D->query_int("cpu_expectation");
        }

        last_4 = ([ "supplied" : 100, "cost" : 0 ]);
        last_3 = ([ "supplied" : 100, "cost" : 0 ]);
        last_2 = ([ "supplied" : 100, "cost" : 0 ]);
        last_1 = ([ "supplied" : 100, "cost" : 0 ]);
        last_0 = ([ "supplied" : 100, "cost" : 0 ]);

        last_check = time();
        last_rusage = rusage();
        counter = 0;
}

void heart_beat()
{
        mapping my;
        mapping info;
        int tlen;
        int supp, cost;

        my = query_entire_dbase();

        counter++;
        if ((tlen = (time() - last_check)) < check_period)
                return;

        // rotate the stat.
        last_4["supplied"] = last_3["supplied"];
        last_4["cost"]     = last_3["cost"];
        last_3["supplied"] = last_2["supplied"];
        last_3["cost"]     = last_2["cost"];
        last_2["supplied"] = last_1["supplied"];
        last_2["cost"]     = last_1["cost"];
        last_1["supplied"] = last_0["supplied"];
        last_1["cost"]     = last_0["cost"];

        supp = counter * 100 / expectation;
        if (supp > 100) supp = 100;
        info = rusage();
        cost = info["stime"] + info["utime"] -
               last_rusage["stime"] - last_rusage["utime"];
        cost = cost / tlen / 10;

        last_rusage = info;
        last_check  = time();
        counter = 0;

        last_0 = ([ "supplied" : supp,
                    "cost"     : cost ]);
}
