// by snowcat
// sameip

#include <ansi.h>

inherit F_CLEAN_UP;

string fname(object ob);

STATIC_VAR_TAG object run_user = 0;

int main(object me, string arg)
{
        object who/*, ob*/;
        int    i/*, j*/, count;
        string *dir/*, *ppls*/;
        string name, address;
        string *result;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg)
	        return notify_fail("指令格式：sameip <使用者姓名> | <IP 地址>\n");

        if (find_call_out("search_dir") != -1)
        {
                if (run_user && run_user != me)
                        return notify_fail("当前" + run_user->query("name") +
                                           "(" + run_user->query("id") + ")" +
                                           "正在使用该指令进行查找，请稍候再使用。\n");
                remove_call_out("search_dir");
        }

        seteuid(getuid());
        if (member_array('.', arg) != -1)
        {                
                address = arg;
        } else
        {
                name = arg;
                if (file_size(DATA_DIR + "login/" + name[0..0] + "/"  + name + __SAVE_EXTENSION__) < 0)
                        return notify_fail("没有这位使用者。\n");

                who = new(LOGIN_OB);
                who->set("id", name);
                if (! who->restore())
                        return notify_fail("没有这位使用者。\n");

                write(fname(who) + "上次从 " + who->query("last_from")+" 上线。\n");
                if (! who->query("last_from"))
                        return notify_fail("无法查知该玩家上次上线地点。\n");
                address = who->query("last_from");
                destruct(who);
        }

        write("寻找从 " + address + " 上线的使用者：\n");
        count = 0;
        dir = get_dir(DATA_DIR + "login/");
        i = 0;
        result = ({ });
        call_out("search_dir", 0, count, dir, i, address, me, result);
        write(HIG "现在系统将统计数据，稍后汇报。\n"
              HIG "进度：" + process_bar(0) + "\n");
        me->attach_system();
        run_user = me;
        return 1;
}

void search_dir(int count, string *dir, int i, string address, object me, string *result)
{
        object ob;
        int j;
        string *ppls/*, name*/, str, adr/*, s1, s2, s3, s4*/;
        string info;

        if (! objectp(me))
        {
                result = 0;
                return;
        }

        if (! me->is_attach_system())
        {
                run_user = 0;
                result = 0;
                return;
        }

        if (i == sizeof(dir))
        {
                info = ESC + "[256D" + ESC + "[K"
                       HIC "\n查找所有玩家的结果如下：\n" NOR WHT;
                for (i = 0; i < sizeof(result); i++)
                {
                        info += result[i];
                        if (i % 20)
                        {
                                message("system", info, me);
                                info = "";
                        }
                }
                info += HIG "共有 " + to_chinese(count) + " 位使用者从这个地址上线。\n\n" NOR;
                message("system", info, me);
                run_user = 0;
                me->detach_system();
                me->write_prompt();
                result = 0;
                return;
        } else
        {
                ppls = get_dir(DATA_DIR + "login/" + dir[i] + "/");
                for(j = 0; j < sizeof(ppls); j++)
                {
                        reset_eval_cost();
                        if (sscanf(ppls[j], "%s.o", str)==1)
                        {
                                ob = new(LOGIN_OB);
                                ob->set("id", str);
                                if (! ob->restore() ||
                                    ! (adr = ob->query("last_from")) ||
                                    strsrch(adr, address) == -1)
                                {
                                        destruct(ob);
                                        continue;
                                }

                                info = sprintf("%-14s%-14s%-11s%-6s%s\n",
                                              ob->query("id"),
                                              fname(ob),
                                              ctime(ob->query("last_on"))[0..10],
                                              ctime(ob->query("last_on"))[20..24],
                                              ob->query("last_from"));
                                result += ({ info });
                                destruct(ob);
                                count++;
                        }
                }
                i++;
        	message("system", ESC + "[1A" + ESC + "[256D"
                                  HIG "进度：" + process_bar(i * 100 / sizeof(dir)) +
                                  "\n" HIR "执行中" NOR "> ", me);
                call_out("search_dir", 0, count, dir, i, address, me, result);
    }
}

string fname(object ob)
{
        string s1, s2;

        s1 = ob->query("surname");
        s2 = ob->query("purename");
        if (! s1) s1= "";
        if (s2) s1 += s2;
        if (s1 == "") s1 = "无名";
        return s1;
}

int  help(object  me)
{
write(@HELP
指令格式：sameip <使用者姓名> | <IP 地址>

查找所有与使用者用同一地址上线的使用者。
HELP
    );
        return  1;
}