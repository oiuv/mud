// examine.c
// created by doing

#include <ansi.h>

inherit F_CLEAN_UP;

private string fname(object ob);
private string examine_player(string name, int copy_user, int raw, int last_touched);
private string is_illegal(object ob);

void create() { seteuid(getuid()); }

public void search_dir(object me, int raw);

int main(object me, string arg)
{
//      int i;
        int copy_user;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg)
	        return notify_fail("指令格式：examine [-u] <玩家ID> | -all\n");

        if (! sscanf(arg, "-u %s", arg))
                copy_user = 0;
        else
                copy_user = 1;

        if (arg != "-all")
        {
                string r;
                r = examine_player(arg, copy_user, 0, 0);
                if (! r) r = sprintf("这位玩家(%s)的数据没有异常。\n", arg);
                write("检查结果：" + r);
                return 1;
        }

	message_system("系统进行数据处理中，请耐心等候...\n");
        write(HIG "现在系统将检查所有玩家，稍后汇报。\n"
              HIG "进度：" + process_bar(0) + "\n");
        if (me)
        {
                me->attach_system();
                me->write_prompt();
        }
        search_dir(me, 0);
        return 1;
}

void search_dir(object me, int raw)
{
        string *dir;
        string *result;
        string name;
        string info;
        mixed *ppls;
        int count;
        int total;
        int i;
        int j;

        if (! is_root(previous_object()))
                return 0;
        log_file("examine", "SYSTEM start examine all player on " +
                 ctime(time()) + ".\n");
        dir = get_dir(DATA_DIR + "login/");
        result = ({ });
        count = 0;
        total = 0;
        for (i = 0; i < sizeof(dir); i++)
        {
                ppls = get_dir(DATA_DIR + "login/" + dir[i] + "/", -1);
                for (j = 0; j < sizeof(ppls); j++)
                {
                        reset_eval_cost();
                        if (sscanf(ppls[j][0], "%s.o", name) == 1)
                        {
                                info = examine_player(name, 0, raw, ppls[j][2]);
                                if (! info) continue;
                                result += ({ info });
                                count++;
                        
                        }
                }
                total += j;
        	message("system", ESC + "[1A" + ESC + "[256D"
                                  HIG "进度：" + process_bar((i + 1) * 100 / sizeof(dir)) +
                                  "\n" + (me ? HIR "执行中" NOR "> " : ""),
                                  me ? me : filter_array(all_interactive(), (: wizardp :)));
        }

        info = HIC "\n检查所有 " HIY + total +
               HIC " 玩家的结果如下：\n" NOR WHT;
        for (i = 0; i < sizeof(result); i++)
        {
                info += result[i];
                if (i % 20)
                {
                        log_file("examine", filter_color(info));
                        if (me) message("system", info, me);
                        info = "";
                }
        }

        if (! count)
                info += HIC "没有任何的玩家数据可能异样。\n" NOR;
        else
                info += HIG "共有 " + to_chinese(count) +
                        " 位玩家数据可能异常。\n\n" NOR;
        log_file("examine", filter_color(info));
        if (me)
        {
                message("system", info, me);
                me->detach_system();
        }
}

private string fname(object ob)
{
        string s1, s2;

        s1 = ob->query("surname");
        s2 = ob->query("purename");
        if (! s1) s1= "";
        if (s2) s1 += s2;
        if (s1 == "") s1 = "无名";
        return s1;
}

// Examine the player, if the player is illegal, I will return
// a detial string, or I will return 0
// If the flag copy_user has been set, I will login the user if
// he is offline
private string examine_player(string name, int copy_user, int raw, int last_touched)
{
        object me;
        object login_ob;
        object user_ob;
        string result;
        int day;
//      int age;
        int online;
        mixed *st;

        if (raw)
        {
                if (! last_touched)
                {
                        st = stat(DATA_DIR + "login/" + name[0..0] + "/" +
                                  name + __SAVE_EXTENSION__);
        
                        if (! arrayp(st) || sizeof(st) < 3)
                                // 可能没有这个文件
                                return sprintf(WHT "无法查阅玩家(%s)的的登录信息。\n" NOR, name);
        
                        // 计算没有上线的时间
                        day = (time() - st[1]) / 86400;
                } else
                        day = (time() - last_touched) / 86400;
/*	系统备份自动删除超过一定时间未登录的玩家	*/
                if (day >= 360 && ! objectp(find_player(name)) && name != "ivy")
                {
                        log_file("static/purge",
                                 sprintf("%s %s was purged by BACKUP_D\n",
                        log_time(), name));
                        UPDATE_D->remove_user(name);
                        return 0;
                }
/*	*/
                if (day >= 1)
                        // 这个文件最近没有访问过
                        return 0;
        }

        login_ob = new(LOGIN_OB);
        login_ob->set("id", name);

        if (! login_ob->restore())
        {
                destruct(login_ob);
                return sprintf(WHT "没有玩家(%s)。\n" NOR, name);
        }

        if (login_ob->query("id") != name)
        {
                string id;
                id = login_ob->query("id");
                destruct(login_ob);
                return sprintf(HIR "玩家(%s)的ID(%s)不正确。\n" NOR, name, id);
        }

        if (! objectp(user_ob = find_player(name)))
        {
                online = 0;
                user_ob = LOGIN_D->make_body(login_ob);
                if (! user_ob)
                {
                        destruct(login_ob);
                        return sprintf(HIR "无法生成玩家(%s)。\n" NOR, name);
                }

                if (! user_ob->restore())
                {
                        destruct(login_ob);
                        destruct(user_ob);
                        return sprintf(HIR "无法读取玩家档案(%s)。\n" NOR, name);
                }
        } else
                online = 1;

        result = is_illegal(user_ob);
        if (result)
        {
                if (online)
                        result = sprintf("%s%-14s%-10s%s%-17s%s%s\n",
                                 WHT,
                                 name,
                                 user_ob->query("name"),
                                 (interactive(user_ob) ? HIC : HIR),
                                 (interactive(user_ob) ? query_ip_number(user_ob) : "断线中"),
                                 NOR,
                                 result);
                else
                        result = sprintf("%s%-14s%-10s%s%-11s%-6s%s%s%s\n",
                                 WHT,
                                 name,
                                 user_ob->query("name"),
                                 HIG,
                                 ctime(login_ob->query("last_on"))[0..10],
                                 ctime(login_ob->query("last_on"))[20..24],
                                 NOR,
                                 result,
                                 (user_ob->is_in_prison() ? HIR "(狱中)" NOR : ""));
        }

        destruct(login_ob);
        if (! online)
        {
                // the user is offline
                if (copy_user)
                {
                        me = this_player();
                        // I should login it
                        message_vision("$N口中念念有词，将$n变了出来。\n",
                                       me, user_ob);
                        catch(user_ob->setup());
                        catch(user_ob->restore_autoload());
                        catch(user_ob->move(environment(me)));
                } else
                {
                        // ok. logout the user
                        destruct(user_ob);
                }
        } else
        {
                if (copy_user)
                {
                        // login user? oh, I needn't do it because the
                        // user is online now.
                        write("玩家目前正在线上。\n");
                }
        }

        return result;
}

private string is_illegal(object ob)
{
        int gold;
        int age;
        int exp;
        int sp;
        int dt;
        int dexp;

        if (wizhood(ob) != "(player)")
                return 0;

        if (ob->query_temp("user_setup"))
                gold = MONEY_D->player_carry(ob);
        else
        {
                mapping list = ([
                        "/clone/money/cash"   : ({ 10, 1, }),
                        "/clone/money/gold"   : ({ 1, 1, }),
                        "/clone/money/silver" : ({ 1, 100, }),
                        "/clone/money/coin"   : ({ 1, 10000, }),
                ]);

                int *val;
                string *autoload;
                string item;
                int amount;
                int i;

                // the user is load by another object but not logind,
                // or the user maybe failed to login, so I will check
                // the autoload of the user.
                autoload = ob->query_autoload_info();
                gold = ob->query("balance") / 10000;

                if (autoload) i = sizeof(autoload); else i = 0;
                for (--i; i >= 0; i--)
                {
                        if (sscanf(autoload[i], "%s:%d", item, amount) != 2)
                                continue;

                        if (! arrayp(val = list[item])) continue;
                        gold += amount * val[0] / val[1];
                        if (gold < 0) break;    // Too much money
                }
        }

        // trans to gold
        age = ob->query("mud_age") / 86400;
        exp = ob->query("combat_exp");
        dexp = exp - (int)ob->query("last_examine/combat_exp");
        dt = time() - (int)ob->query("last_examine/time");
        if (dt > 60)
        {
                ob->set("last_examine/combat_exp", exp);
                ob->set("last_examine/time", time());
                if (! ob->query_temp("user_setup"))
                        ob->save();
        }

        if (gold > 2000)
                return HIY "拥有 " + gold + " 两黄金" NOR;

        if (exp < 1000000 && gold >= 1000)
                return HIC "经验 1M 以内拥有 " + gold + " 两黄金" NOR;

        if ((exp > 1000) && (dt > 60) && ((sp = dexp * 60 / dt) > 90))
                return HIR "平均经验速度太快(" + sp + "/分钟:" + dt / 60 + "分钟)" NOR;

        if (gold >= 100 && age < 1)
                return HIC "14岁拥有 " + gold + " 两黄金" NOR;

        return 0;
}

int  help(object  me)
{
write(@HELP
指令格式：examine [-u] <玩家ID> | -all

查找玩家，判断数据是否正常。如果使用了[-u]参数，则除了检查玩
家，还会将不在线上玩家复制出来，以供详细查阅。

判断依据：
1. 超过 20000 两黄金。
2. 经验 1M 以内超过 3000 两黄金。
3. 平均经验速度超过 (120/m)。
4. 14岁金钱超过 100 两黄金。

HELP
    );
        return  1;
}