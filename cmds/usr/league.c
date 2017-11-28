// league.c

#include <ansi.h>
#include <getconfig.h>

inherit F_CLEAN_UP;
inherit F_DBASE;
inherit F_SAVE;

void create() { seteuid(getuid()); }

int sort_hatred(string id1, string id2, mapping hatred);
int sort_member(string id1, string id2);
int show_league_info(object me, string arg);
int show_league_member(object me, string arg);
int show_league_hatred(object me, string arg);
int dismiss_league(object me, string arg);
int add_member(object me, string arg);
int remove_member(object me, string arg);
int help(object me);
int league_kill(object me, string arg);

int main(object me, string arg)
{
//      object *obs;
        string fname;
        string *args;
        string* member;
        object ob;
        int lvl, lvlold;
        mapping lvls = ([
              0 : "０",
              1 : "★",
              2 : "★★",
              3 : "★★★",
              4 : "★★★★",
        ]);

        if (time() - me->query_temp("scan_time") < 3
           && ! wizardp(me) && arg != "check")
                return notify_fail("等等，系统喘气中……\n");

        if (! arg) arg = "info";
        args = explode(arg, " ");
        if (sizeof(args) > 1)
                arg = implode(args[1..<1], " ");
        else
                arg = 0;

        me->set_temp("scan_time", time());

        switch (args[0])
        {
        case "?":
                help(me);
                return 1;
        case "check":
                if (! stringp(fname = me->query("league/league_name")))
                        return 1;

                member = LEAGUE_D->query_members(me);

                if (! sizeof(member))
                {
                        // 同盟已经解散
                        write(HIR "\n【离线通告】同盟通告：你离线的时候你所在同盟已解散！\n" NOR);
                        me->delete("league");
                        return 1;
                }
                // 判断是否该玩家在离线的时候被开除或者同盟是否已解散
                if (member_array(me->query("id"), member) == -1)
                {
                        write(HIR "\n【离线通告】同盟通告：你离线的时候你所在同盟已将你开除！\n" NOR);
                        LEAGUE_D->add_league_fame(me, -1 * me->query("weiwang"));
                        me->delete("league");

                        return 1;
                }

        case "info":
                // 显示同盟的信息
                return show_league_info(me, arg);

        case "member":
                if (! wizardp(me))
                        return notify_fail("你没有足够权限！\n");

                return show_league_member(me, arg);

        case "dismiss":
                if (! stringp(fname = me->query("league/league_name")))
                        return notify_fail("你现在还没有和任何人结义成盟呢。\n");

                if (me->query("id") != me->query("league/leader_id")
                    && ! wizardp(me))
                        return notify_fail("只有同盟领袖或者巫师才能解散同盟！\n");

                return dismiss_league(me, arg);

        case "add":
                if (! stringp(fname = me->query("league/league_name")))
                        return notify_fail("你现在还没有和任何人结义成盟呢。\n");

                if (me->query("id") != me->query("league/leader_id")
                    && ! me->query("league/grant"))
                        return notify_fail("你没有足够权限收取成员！\n");

                return add_member(me, arg);

        case "join":
                if (! stringp(me->query_temp("wait_reply")))
                        return notify_fail("现在没有同盟邀请你加入！\n");
                
                ob = find_living(me->query_temp("wait_reply"));
                if (! objectp(ob))
                {
                        me->delete_temp("wait_reply");
                        return notify_fail("刚才邀请你的人已经不在线上了！\n");
 
                }               

                me->set_temp("wait_join", 1);
                
                add_member(ob, me->query("id"));
                me->delete_temp("wait_reply");
                me->delete_temp("wait_join");

                return 1;

        case "grant":
                sscanf(arg, "%s %d", arg, lvl);

                if (! stringp(fname = me->query("league/league_name")))
                        return notify_fail("你现在还没有和任何人结义成盟呢。\n");

                if (me->query("id") != me->query("league/leader_id"))
                        return notify_fail("只有同盟领袖才能使用该指令！\n");

                if (! arg || 
                    ! intp(lvl) || 
                    lvl < 0 || 
                    lvl > 4)return notify_fail("指令格式： league grant [id] [权限等级(0—4)]。\n");
             
                ob = find_living(arg);

                if (! objectp(ob))
                        return notify_fail("这个用户目前没有登陆！\n");
         
                if (me->query("league/league_name") != ob->query("league/league_name"))
                        return notify_fail("看清楚了，他不是你的成员！\n");

                if (me == ob)return notify_fail("你已经是领袖了！\n");

                // 根据 lvl 授予权限
                lvlold = ob->query("league/grant");
                ob->set("league/grant", lvl);

                CHANNEL_D->do_channel( me, "inter", HIY + me->name() + HIG
                           " 修改了 " HIY + ob->name() + HIG " 的权限。  "
                           HIG + lvls[lvlold] + "→" + lvls[lvl] + "\n" NOR);

                return 1;
                                
        case "kick":
                if (! stringp(fname = me->query("league/league_name")))
                        return notify_fail("你现在还没有和任何人结义成盟呢。\n");

                if (me->query("id") != me->query("league/leader_id")
                    && me->query("league/grant") < 3)
                        return notify_fail("你没有足够权限开除成员！\n");

                if (me->query("id") == arg)
                        return notify_fail("自己踢自己？\n");

                if (me->query("league/leader_id") == arg)
                        return notify_fail("好啊，连领袖都敢踢？\n");
                                     
                return remove_member(me, arg);
                                
        case "top":
                return "/cmds/usr/top"->main(me, "league");

        case "hatred":
                // 显示同盟的仇人
                return show_league_hatred(me, arg);

        case "kill":
                if (! stringp(fname = me->query("league/league_name")))
                        return notify_fail("你现在还没有和任何人结义成盟呢。\n");

                if (me->query("id") != me->query("league/leader_id")
                    && ! wizardp(me) &&  me->query("league/grant") < 2)
                        return notify_fail("你没有足够权限号召同盟成员参与战斗！\n");

                // 同一房间内拥有足够权限的号令所有成员对某对象发动攻击
                return league_kill(me, arg);

        case "set":
                // 同盟中个人的参数设置
                if (! arg)
                {
                         write("你目前设置如下：\n");
                         write("no_kill    == " + me->query("league/set/no_kill") + "\n");
                         write("weiwang    == " + me->query("league/set/weiwang") + "％\n");

                         return 1; 
                }
                sscanf(arg, "%s %d", arg, lvl);
                if (arg != "no_kill" 
                    && arg != "weiwang"
                    && arg != "follow")
                {
                         write("指令格式：league set <参数> <变量> 。\n");
                         write("变量    ：no_kill   <1>不参与同盟战斗。\n");
                         write("                    <0>参与同盟战斗。\n");
                         write("          weiwang   <0—100> 获得威望时分将威望的 weiwang % 分给同盟。\n\n");

                         return 1;

                }

                if (lvl <= 0)lvl = 0;
                if (lvl >= 100)lvl = 100;
                
                me->set("league/set/" + arg, lvl);
                write(HIG "OK！\n" NOR);
                
                return 1;
          
        case "title": 
                if (! stringp(fname = me->query("league/league_name")))
                        return notify_fail("你现在还没有和任何人结义成盟呢。\n");

                if (me->query("id") != me->query("league/leader_id")
                    && ! wizardp(me) &&  me->query("league/grant") < 4)
                        return notify_fail("你没有足够权限！\n");

                sscanf(arg, "%d %s", lvl, arg);

                if (!arg || lvl <=0 || lvl > 5)
                {
                        write("指令格式：league title <权限等级(1-4)> <封号> .\n");
                        return 1;
                }
                
                write("制作中 ...\n");
                return 1;                
        case "out":
                if (! stringp(fname = me->query("league/league_name")))
                        return notify_fail("你现在还没有和任何人结义成盟呢。\n");

                if (me->query_temp("pending/out_league"))
                {
                        // 同盟的声望下降
                        if (me->query("weiwang") < LEAGUE_D->query_league_fame(fname) / 10)
                                  LEAGUE_D->add_league_fame(fname, -1 * LEAGUE_D->query_league_fame(fname) / 10);
                        else 
                                  LEAGUE_D->add_league_fame(fname, -1 * me->query("weiwang"));
                        CHANNEL_D->do_channel(this_object(), "rumor",
                                "听说" + me->name(1) + "(" + me->query("id") +
                                ")义无反顾，已经背离「 " HIG + fname + HIM" 」而去。");
                        me->delete_temp("pending/out_league");

                        // 清除该用户在同盟中的信息
                        UPDATE_D->clear_user_data(me->query("id"), "league");
                        return 1;
                }

                write("你真的想要背弃当初的结义好友吗？这样做会降低" + fname + "的声望。\n"
                      YEL "如果你确定了，就再输入一次 league out 命令。\n" NOR);
                me->set_temp("pending/out_league", 1);
                return 1;
        }

        write("无效的参数。\n");
        return 1;
}

// 根据玩家和参数选择同盟的名字
mixed select_league(object me, string arg)
{
        string fam;
        object ob;

        if (! wizardp(me))
                // only wizard can show every league's list
                fam = 0;
        else
        if (stringp(arg) && arg != "")
        {
                if (! arrayp(LEAGUE_D->query("member/" + fam)))
                        fam = 0;
                else
                        fam = arg;

                if (! stringp(fam) && objectp(ob = UPDATE_D->global_find_player(arg)))
                {
                        // 没有 arg 这个同盟，查看是否有该玩家
                        fam = ob->query("league/league_name");
                        UPDATE_D->global_destruct_player(ob);
                        if (! stringp(fam))
                                return notify_fail("这人现在没有和别人结成同盟。\n");
                }

                if (! stringp(fam))
                        return notify_fail("没有这个玩家，不能查阅相关的同盟。\n");
        }

        if (! fam)
        {
                // select my league
                if (! stringp(fam = me->query("league/league_name")))
                        return notify_fail("你现在还没有和别人结义成盟呢。\n");
        }

        return fam;
}

// 显示同盟的仇人
int show_league_hatred(object me, string arg)
{
        mapping hatred;
        string fam;
        string *ids;
        mixed *data;
        string msg;
        string st;
        int count;
        int i;

        if (! stringp(fam = select_league(me, arg)))
                return 0;

        hatred = LEAGUE_D->query_league_hatred(fam);
        if (! mapp(hatred) || ! sizeof(hatred))
        {
                write(fam + "现在没有什么仇人。\n");
                return 1;
        }

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

// 显示某一个同盟中的人员
int show_league_member(object me, string arg)
{
        string *member;
        string id;
        object user;
        string msg;
        int n;

        if (! arg)
        {
                if (! stringp(arg = me->query("league/league_name")))
                        return notify_fail("你现在还没有加入任何一个同盟呢。\n");
        }

	if (! arrayp(member = LEAGUE_D->query_members(arg)))
        {
                write("现在江湖上没有(" + arg + ")这个字号。\n");
                return 1;
        }

        if (sizeof(member) < 1)
                return notify_fail(arg + "现在人丁稀落。\n");

        if (! wizardp(me))
        {
                if (me->query("jing") < 50)
                        return notify_fail("你现在精神不济，无法打听这些消息。\n");

                if (me->is_busy())
                        return notify_fail("你现在正忙，没有时间打听这些消息。\n");

                me->receive_damage("jing", 50);
                me->start_busy(3);
        }

        msg = "";
        n = 0;
        foreach (id in member)
        {
                user = UPDATE_D->global_find_player(id);
                if (! objectp(user))
                        continue;

                n++;
                msg += user->short(1) + "\n";
                UPDATE_D->global_destruct_player(user);
        }

        if (msg == "")
                return notify_fail(arg + "现在人丁稀落。\n");

        write(arg + "目前有以下" + chinese_number(n) + "人：\n" + msg);
        return 1;
}

// 显示同盟中的信息
int show_league_info(object me, string arg)
{
        string fam;
        object  ob;
        string  msg;
        string pro;
        string *member;
        string  id;
        string leader_id, leader_name;
        int lvl;
        mapping lvls = ([
              0 : "０",
              1 : "★",
              2 : "★★",
              3 : "★★★",
              4 : "★★★★",
        ]);

        if (! stringp(fam = select_league(me, arg)))
                return 0;

        if (fam == me->query("league/league_name"))
                pro = "你";
        else
                pro = fam;

	if (! arrayp(member = LEAGUE_D->query_members(fam)))
        {
                write("现在江湖上没有(" + fam + ")这个字号。\n");
                return 1;
        }

        if (sizeof(member) < 1)
                return notify_fail(pro + "现在没有一个兄弟。\n");

        leader_id = me->query("league/leader_id");
        leader_name = me->query("league/leader_name");

        msg = "\n以下是 「" HIG + me->query("league/league_name") + NOR " 」"
              " 的具体信息：" HIY "      【同盟领袖】： " + leader_name +
              "(" + leader_id + ")\n\n" NOR;

        member = sort_array(member, (: sort_member :));
        foreach (id in member)
        {
                msg += sprintf(WHT "%-10s  ", id);
                if (objectp(ob = find_player(id)))
                {
                        msg += sprintf(HIY "在线   "
                                       NOR WHT "经验：" HIC "%-9d "
                                       NOR WHT "阅历：" HIW "%-8d "
                                       NOR WHT "威望：" HIY "%-8d\t" NOR,
                                       ob->query("combat_exp"),
                                       ob->query("score"),
                                       ob->query("weiwang"));
                       if (lvl = ob->query("league/grant"))
                               msg += HIG + lvls[lvl] + "\n" NOR;
                       else    
                               msg += "\n";
                }
                else
                        msg += HIR "不在线\n" NOR;
        }

        msg += sprintf("\n现在%s中一共有%s位好友，在江湖上具有 %s%d%s 点声望。\n",
                       fam, chinese_number(sizeof(member)),
                       HIY, LEAGUE_D->query_league_fame(fam), NOR);
        write(msg);

	return 1;
}

// 解散同盟
int dismiss_league(object me, string arg)
{
        string *member;
//      string id;
//      object user;
//      string msg;
//      int n;

        if (! arg)
                return notify_fail("你要解散哪个同盟？\n");

	if (! arrayp(member = LEAGUE_D->query_members(arg)))
        {
                write("现在江湖上没有(" + arg + ")这个字号。\n");
                return 1;
        }

        if (arg != me->query("league/league_name")
            && ! wizardp(me))
        {
                write("你只能解散你所在的同盟。\n");
                return 1;
        }

        write(HIR "你强行解散了" + arg + "。\n" NOR);
        LEAGUE_D->dismiss_league(arg);
        return 1;
}

// 添加一个成员
int add_member(object me, string arg)
{
        object member;
        string *members;
        string fam;

        if (! arg)
              return notify_fail("你要收取谁为成员？\n");

        member = find_living(arg);
        fam = me->query("league/league_name");
        members = LEAGUE_D->query_members(fam);
        members = sort_array(members, (: sort_member :));

        if (! objectp(member))
        {
              write(arg + " 这个人并不在线上，无法收取该成员！\n");
              return 1;
        }

        if (! userp(member))
        {
              write("只能收取玩家为成员！\n");
              return 1;
        }

        if (member->query("league/league_name"))
        {
              write("这个玩家已经加入了一个同盟！\n");
              return 1;
        }

        //同盟最多三十个人
        if (sizeof (members) >= 30)
        {
              write(HIR "同盟中最多只能有三十个人！\n");
              return 1;
        }

        if (! member->query_temp("wait_join"))
        {
              write(HIG "信息已发出，正等待对方回应！\n" NOR);
              tell_object(member, "\n" + HIY + me->name() + "(" + me->query("id") + ")邀请你加入 「" 
                          HIG +  me->query("league/league_name") + HIY " 」"
                          "，如果你愿意请输入： league join 。\n");

              member->set_temp("wait_reply", me->query("id"));

              return 1;

        }
       
        if (LEAGUE_D->add_member_into_league(me->query("league/league_name"), arg, me))
        {
              CHANNEL_D->do_channel( this_object(), "rumor", "听说" + member->name() + "(" + 
                                     member->query("id") + ")加入了 「" HIC + me->query("league/league_name") +
                                     HIM " 」。\n" NOR);
              me->delete_temp("wait_reply");
              me->delete_temp("wait_join"); 
              LEAGUE_D->add_league_fame(me, member->query("weiwang"));
        }

        return 1;
       
}

// 开除一个成员
int remove_member(object me, string arg)
{
//      object ob;
        string* member;

        if (! arg)
              return notify_fail("你要开除哪个成员？\n");
        
        if (arg == me->query("id"))
              return notify_fail("这样的话你还不如解散同盟算了！\n");

        member = LEAGUE_D->query_members(me);

        if (member_array(arg, member) == -1)
              return notify_fail("你所在同盟中没有这号人！\n");
         
        LEAGUE_D->remove_member_from_league(me->query("league/league_name"), arg, 1);

        return 1;
      
}


// 给所有的仇恨对象排序
int sort_hatred(string id1, string id2, mapping hatred)
{
        mixed *d1, *d2;

        if (! arrayp(d1 = hatred[id1]) || sizeof(d1) < 2 || ! intp(d1[1]))
                return 1;

        if (! arrayp(d2 = hatred[id2]) || sizeof(d2) < 2 || ! intp(d2[1]))
                return -1;

        return d2[1] - d1[1];
}

// 给同盟中的所有结义成员排序
int sort_member(string id1, string id2)
{
        object ob1, ob2;

        ob1 = find_player(id1);
        ob2 = find_player(id2);
        if (! objectp(ob1) && ! objectp(ob2))
                return strcmp(id2, id1);

        if (objectp(ob1) && objectp(ob2))
                return ob2->query("combat_exp") - ob1->query("combat_exp");

        if (objectp(ob1))
                return -1;

        return 1;
}

// league kill 
int league_kill(object me, string arg)
{
        // league kill 命令使用的标志
        int kill_flag;
        int want_kill_flag;
        
        object lob, obj, env;
        object *l;

        string /*leader,*/ league_name;

        env = environment(me);

        if (env->query("no_fight"))
                return notify_fail("这里不能战斗。\n");
        
        league_name = me->query("league/league_name");

        if (! arg || ! objectp(obj = present(arg, env)))
                return notify_fail("你想攻击谁？\n");

        if (! obj->is_character() || obj->is_corpse())
                return notify_fail("看清楚了，那不是活人！\n");

        l = all_inventory(env);       

        foreach (lob in l)
        {
             if (me->query("league/leader_id") == lob->query("id"))
                      return notify_fail("领袖都还没发话，你着什么急？\n");

             if (! objectp(lob) ||
                 ! living(lob) ||
                 lob->query("doing") ||
                 lob->query("league/league_name") != league_name ||
                 lob->query("league/set/no_kill") ||
                 lob->query("id") == obj->query("id"))l -= ({ lob });
        }

        if (! sizeof(l) || sizeof(l) <= 1)
                return notify_fail("目前没有人能听你号召！\n");

        if (obj == me)
                return notify_fail("什么？你要自杀也不要叫别人啊！\n");

        if (league_name == obj->query("league/league_name"))
                return notify_fail("你想攻击你自己同盟成员？好像没人会听你的话。\n");


        message_vision("\n$N一挥手，喝道：“ 「" HIY + league_name + NOR"」 的兄弟们大家一起"
                       "来对付" + obj->name() + "！”\n\n",
                       me, obj);

        switch (obj->accept_kill(me))
	{
	case 0:
                return (! objectp(obj));
	case -1:
                if (objectp(obj) &&
                    ! me->is_killing(obj->query("id")))
                {
                        // 因为某种原因战斗没有发生
		        return 1;
                }
	default:
	}

        // 战斗已经发生，队伍中所有的人参与战斗
        message("vision", HIR "你和大家一起跟着" + me->name(1) +
                          HIR "冲了上去，围着" + obj->name() +
                          "就是一顿乱砍。\n" NOR, l, ({ me }));

        // 判断是否是我先主动想杀死对方
        if (userp(me) && userp(obj))
        {
                // 对方想杀害的人和我们对我中的成员
                string *obj_wants;
                object *all_team;

                // 重新取队伍的人员 - 因为队伍中晕倒的成员
                // 没有包含在 l 数组中。
                l = all_inventory(env);       
                foreach (lob in l)
                {
                       if (! objectp(lob) ||
                           ! living(lob) ||
                           lob->query("doing") ||
                           lob->query("league/league_name") != league_name ||
                           lob->query("id") == me->query("id"))l -= ({ obj });
              
                }

                all_team = l;

                all_team -= ({ 0 });
                obj_wants = obj->query_want() - ({ 0 });
                if (sizeof(obj_wants - l->query("id")) != sizeof(obj_wants))
                {
                        // 对方想杀害我们对我中的某一些人，
                        // 因此认为是对方想杀害我们，否则
                        // 反之
                        want_kill_flag = 0;
                } else
                {
                        me->want_kill(obj);
                        want_kill_flag = 1;
                }
        }

        // 判断对方是否会杀死我
        if (living(obj) && ! userp(obj))
        {
                // 对方会杀死我们
                obj->kill_ob(me);
                kill_flag = 1;
        } else
        {
                // 对方不会杀死我们，只是攻击我们
                obj->fight_ob(me);
                kill_flag = 0;
        }

        // 驱动队伍中所有的人
        foreach (lob in l)
        {
                // 杀人方向和队长保持一致：如果对方
                // 主动攻击队伍中的某一个人，则设置
                // 是对方挑衅
                if (want_kill_flag)
                        lob->want_kill(obj);

                lob->kill_ob(obj);

                // 设置对手的攻击状态和队长保持一致
                if (kill_flag)
                        obj->kill_ob(lob);
                else
                        obj->fight_ob(lob);
        }

        return 1;

}

int help(object me)
{
   	write(@HELP

指令格式: league info [玩家] | hatred [玩家] | member [同盟名字] | top
          
查看目前你结义的同盟的各种信息，其中：

info     ：查看同盟中的人物，成员状态，声望。
hatred   ：查看同盟的仇恨对象。
member   ：查看某个同盟的成员（仅巫师可用）。
top      ：查看结义同盟的声望排名。

add      ：增加一个同盟成员。
kick     ：开除一个同盟成员。
dismiss  ：强行解散当前同盟。
？       ：查看有关同盟指令的信息。
kill     ：号召同一房间的成员攻击某一目标（计划中的玩家除外）。
grant    ：修改成员权限。
           格式： league grant [id] [0-4]
                  0 ：取消该成员所有权限。
                  1 ：league add [] 权限。 
                  2 ：league kill [] 权限。 
                  3 ：league kick [] 权限。
                  4 ：待扩展。
            注：权限是从0到4递增，比如赋予了某人（league grant who 3）的权限，
                那么该人不但有kick的权限，而且低于kick以下的权限（add, kill）
                都将拥有。

set      ： 参数设置。
            格式：league set <参数>  <变量> 。
                  league set          ：显示当前设置。
                  league set no_kill  ：不参与同盟战斗（不响应任何人号召league kill）。
                  league set weiwang  ：每次获取威望的时候将分给同盟 weiwang％　的威望。             

巫师可以查看各个同盟的信息，只需要在命令后面加上同盟的名字或
是同盟中的玩家。另外巫师或者该同盟领袖可以使用 league dismiss 
命令强行解散一个同盟。

see also: team (团体同盟)
HELP );
   	return 1;
}