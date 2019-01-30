// leagued.c

#include <ansi.h>

// #pragma optimize
// #pragma save_binary

inherit F_SAVE;
inherit F_DBASE;

// 同盟声望最大是10亿
#define MAX_LEAGUE_FAME         1000000000

// 每个同盟最多有100个仇人
#define MAX_HATRED_PERSON       100

// 当仇人超过的时候每次移除多少个
#define HATREDP_REMOVED         10

mapping league_fame;
mapping last_league_fame;

// 同盟对仇人仇恨度的排序
private int sort_hatred(string id1, string id2, mapping hatred);

void create()
{
        seteuid(getuid());
        restore();
        set_heart_beat(1800 + random(30));
        if (! mapp(league_fame)) league_fame = ([ ]);
}

void remove()
{
        save();
}

public void mud_shutdown()
{
        save();
}

// 心跳：维护同盟的通常信息
private void heart_beat()
{
        int t;
        int last;
        string *all_fam;
        string fam;

        t = time();
        last = query("last_check");
        if ((t / 86400) != (last / 86400))
        {
                // 天数发生了变化：复制同盟的名望信息
                all_fam = keys(league_fame) - ({ 0 });
                last_league_fame = ([ ]);

                foreach (fam in all_fam)
                        last_league_fame[fam] = league_fame[fam];
        }
        set("last_check", t);

        // 保存同盟的最新信息
        save();
}

// 返回同盟声望：如果参数为空，返回mapping类型，包含了所有同
// 盟的声望；如果参数是人物， 则返回该人物所在的那个同盟的声
// 望；如果参数是同盟，则返回该同盟的声望。
public mixed query_league_fame(mixed ob)
{
        string fname;

        if (stringp(ob))
                return league_fame[ob];

        if (objectp(ob))
        {
                if (stringp(fname = ob->query("league/league_name")))
                        return league_fame[fname];
                else
                        return 0;
        }

        return league_fame;
}

// 查询昨天的同盟名望信息
public mapping query_all_last_league_fame()
{
        if (! mapp(last_league_fame))
                // 没有昨天的信息，返回今天的
                return league_fame;

        // 返回昨天的同盟声望信息
        return last_league_fame;
}

// 查询同盟的仇恨信息：输入的ob可以是同盟的名字，也可是同盟
// 中的人物。
public mapping query_league_hatred(mixed ob)
{
        mapping hatred;
        string fname;

        if (objectp(ob))
                fname = ob->query("league/league_name");
        else
        if (stringp(ob))
                fname = ob;
        else
                fname = 0;

        if (! stringp(fname) || ! mapp(hatred = query(fname + "/hatred")))
                return 0;

        return hatred;
}

// 变化同盟声望：输入的ob可以是同盟的名字，也可是同盟中的人
// 物。
public void add_league_fame(mixed ob, int n)
{
        int new_fame;
        string fname;

        if (objectp(ob))
                fname = ob->query("league/league_name");
        else
        if (stringp(ob))
                fname = ob;
        else
                fname = 0;

        if (! stringp(fname) || undefinedp(query(fname + "/member")))
                return;

        // 计算新的同盟声望
        new_fame = league_fame[fname] + n;
        if (new_fame < 0) new_fame = 0;
        if (new_fame > MAX_LEAGUE_FAME)
                new_fame = MAX_LEAGUE_FAME;
        league_fame[fname] = new_fame;
}

// 同盟间仇杀
public void league_kill(object killer, object victim)
{
        int kexp;
        int vexp;
        string vfam;
        string kfam;
        string kid;
        int fame_delta;
        mapping hatred;
        mixed *d;

        // 只有玩家之间的仇杀才计算在内
        if (! objectp(killer) || ! playerp(killer) ||
            ! objectp(victim) || ! playerp(victim))
                return;

        // 巫师之间的比划可不能算数
        if (wizardp(killer) || wizardp(victim))
                return;

        // 查看这两个玩家所处的结义同盟
        kfam = killer->query("league/league_name");
        vfam = victim->query("league/league_name");

        if (killer->is_brother(victim) && killer->is_killing(victim->query("id")))
                // 杀死结拜兄弟，威望降低10%
                killer->add("weiwang", -killer->query("weiwang") / 10);

        if (! stringp(kfam) && ! stringp(vfam))
                // 都不在同盟内，不必继续了
                return;

        kexp = killer->query("combat_exp");
        vexp = victim->query("combat_exp");

        if (kfam == vfam)
        {
                if (! killer->is_killing(victim->query("id")))
                        // 失手所杀，不予理会
                        return;

                // 兄弟间残杀？不与理会，直接扣除联盟和个人1/10威望。
                add_league_fame(kfam, -league_fame[kfam] / 10);
                killer->add("weiwang", -killer->query("weiwang") / 10);
                return;
        }

        if (kexp < vexp * 3 && vexp >= 100000)
        {
                // 杀手的经验不是远远的大于对方，并且被杀的
                // 人有一定的经验，这将导致同盟声望的降低。
                fame_delta = vexp + killer->query("score") * 2 +
                             killer->query("weiwang") * 10;
                fame_delta /= 1000;
        } else
                // 对手经验太少，或是差距太大，不影响声望
                fame_delta = 0;

        // 查看杀手所在的同盟是否仇恨死者：如果仇恨，则能够
        // 带动声望的变化。
        if (stringp(kfam))
        {
                string path;

                path = kfam + "/hatred/"+ victim->query("id");
                d = query(path);
                if (arrayp(d) && sizeof(d) >= 2 && intp(d[1]))
                {
                        // 仇恨死者，同盟获得额外的声望
                        if (d[1] > 2000)
                                CHANNEL_D->do_channel(this_object(), "rumor",
                                        "听说" + killer->name(1) + "击毙了" +
                                        victim->name(1) + "，为" +
                                        kfam + "出了一口恶气。");
                        fame_delta += d[1] / 3;

                        // 对此人的仇恨降低(降低的要比增加的要多)，
                        // 具体可以看fame_delta 与仇恨度公司的差异
                        d[1] -= fame_delta;
                        if (d[1] <= 0)
                                delete(path);
                        else
                                set(path, d);
                }
        }

        // 调整两个同盟的声望
        add_league_fame(killer,  fame_delta);
        add_league_fame(victim, -fame_delta);

        // 统计该杀手对本门的残害程度
        if (! stringp(vfam))
                return;

        // 仇恨程度和声望的变化都是在一个数量级上(K经验)，但
        // 是仇恨程度低于声望的变化。
        vexp = vexp / 1000 + 1;
        if (vexp > 5000)
                vexp = (vexp - 5000) / 16 + 2000;
        else
        if (vexp > 1000)
                vexp = (vexp - 1000) / 4 + 1000;

        kid = killer->query("id");
        if (! mapp(hatred = query(vfam + "/hatred")))
        {
                set(vfam + "/hatred/" + kid,
                    ({ killer->name(), vexp }));
                return;
        }

        // 每个同盟最多记录若干个仇人
        if (! undefinedp(d = hatred[kid]))
        {
                if (! arrayp(d) || sizeof(d) < 2 ||
                    ! intp(d[1]) || ! stringp(d[0]))
                {
                        // 这个ID的数据出了故障
                        d = 0;
                }
        } else
        if (sizeof(hatred) >= MAX_HATRED_PERSON)
        {
                string *ids;
                int i;

                // 过滤去掉一些人，为什么不去掉一个？这是为
                // 了防止过滤频繁的进行过滤操作。
                ids = sort_array(keys(hatred),
                                 (: sort_hatred :), hatred);
                for (i = 0; i < sizeof(ids) && i < HATREDP_REMOVED; i++)
                        map_delete(hatred, ids[i]);
        }

        if (! arrayp(d))
                d = ({ killer->name(1), vexp });
        else
        {
                d[0] = killer->name(1);
                d[1] += vexp;
        }

        // 记录这个人的信息
        hatred[kid] = d;
}

// 去掉所有同盟对某个人的仇恨信息
public void remove_hatred(string id)
{
        mapping dbase, league, hatred;
        string fam;

        if (! mapp(dbase = query_entire_dbase()))
                // 现在还没有仇恨信息
                return;

        // 查阅所有的同盟
        foreach (fam in keys(dbase))
        {
                reset_eval_cost();

                if (! mapp(league = dbase[fam]))
                        continue;

                if (mapp(hatred = league["hatred"]))
                        // 去掉该同盟对某人的仇恨信息
                        map_delete(hatred, id);

                if (! mapp(hatred) || sizeof(hatred) < 1)
                        // 这个同盟已经没有仇恨信息
                        map_delete(league, "hatred");
        }

        save();
}

// 查看是否可以创建这个同盟
public mixed valid_new_league(string fname)
{
        if (query(fname + "/member"))
                return "人家早就有叫这个的啦，你就别凑热闹了。\n";

        if (! undefinedp(FAMILY_D->query_family_fame(fname)))
                return "江湖赏已经有" + fname + "了，你还想做什么？\n";

        return 0;
}

// 创建同盟
public void create_league(string fname, int base, object *obs)
{
        mapping league;
        string *channels;
        object ob;
        string leader_id, leader_name;
        int i;

        league_fame[fname] = base;
        if (! mapp(last_league_fame))
                last_league_fame = ([ fname : base ]);
        else
                last_league_fame[fname] = base;

        set(fname, ([ "member"      : obs->query("id"),
                      "time"        : time(),
                      "leader_id"   : leader_id,
                      "leader_name" : leader_name ]));
        save();

        // 获取同盟首领id
        for (i = 0; i < sizeof(obs); i ++)
        {
                if (obs[i]->is_team_leader())
                {
                      leader_id = obs[i]->query("id");
                      leader_name = obs[i]->name();
                      break;                    
                }

        }
        foreach (ob in obs)
        {
                league = ([ "time"        : time(),
                            "league_name" : fname, 
                            "leader_id"   : leader_id,
                            "leader_name" : leader_name ]);

                ob->set("league", league);
                channels = ob->query("channels");
                if (! arrayp(channels) || ! sizeof(channels))
                        channels = ({ "inter" });
                else
                if (member_array("inter", channels) == -1)
                        channels += ({ "inter" });

                ob->set("channels", channels);
                ob->save();
        }
}

// 解散同盟
public void dismiss_league(string fname)
{
        string *ids;
        string id;
        object ob;

        // 清除名望信息
        map_delete(league_fame, fname);
        if (mapp(last_league_fame)) map_delete(last_league_fame, fname);


        // 清除同盟中的所有玩家的相关信息
        ids = query(fname + "/member");

        if (arrayp(ids))
        {
                // 同盟中还有玩家，清除他们的信息
                foreach (id in ids)
                {
                        // 处理中
                        reset_eval_cost();
                        ob = 0;
                        ob = find_living(id);

                        if (objectp(ob))ob->delete("league");
                        
                        //UPDATE_D->clear_user_data(id, "league");
                }
        }

        // 清除同盟的所有信息
        delete(fname);

        CHANNEL_D->do_channel(this_object(), "rumor",
                   "听说 「"HIG + fname + HIM"」 人才凋零，昔日好友尽皆散去，从此江湖再无此字号了。");
        
}

// 查询同盟中的弟兄
public string *query_members(mixed ob)
{
        string *member;
        string fname;

        if (objectp(ob))
                fname = ob->query("league/league_name");
        else
        if (stringp(ob))
                fname = ob;
        else
                fname = 0;

        if (! stringp(fname) || ! arrayp(member = query(fname + "/member")))
                return 0;

        return member;
}

// 从同盟中去掉一个人
public int remove_member_from_league(mixed fname, string id, int flag)
{
        mapping league;
        string *member;
        object ob;

        if (objectp(fname))
        {
                // fname is user object
                id = fname->query("id");
                if (! stringp(fname = fname->query("league/league_name")))
                        return 0;
        } else
        if (! stringp(fname))
                // or fname must be a league name
                return 0;

        if (! mapp(league = query(fname)) ||
            ! arrayp(member = league["member"]))
                // no such league or no member in the league
                return 0;

        member -= ({ id, 0 });

        ob = find_living(id);
        if (objectp(ob) && flag)
        {
                LEAGUE_D->add_league_fame(ob, -1 * ob->query("weiwang"));
                ob->delete("league");
                CHANNEL_D->do_channel(this_object(), "rumor",
                        "听说"HIY + ob->name() + HIM"被 「" HIG + fname + HIM "」 开除了。");
               
        }        
        else write(HIG "OK！\n");

        if (sizeof(member) < 1)
        {
                CHANNEL_D->do_channel(this_object(), "rumor",
                        "听说 「" HIG + fname + HIM " 」人才凋零，昔日好友尽皆散去，从此江湖再无此字号了。");

                // 清除名望信息
                map_delete(league_fame, fname);
                if (mapp(last_league_fame)) map_delete(last_league_fame, fname);

                // 清除同盟的信息
                delete(fname);
        } else
                league["member"] = member;
}

// 在同盟中增加一个人
public int add_member_into_league(string fname, string id, object me)
{
        string *member;
        object ob;
        mapping league;
        string* channels;

        if (! arrayp(member = query(fname + "/member")))
                return 0;

        if (member_array(id, member) != -1)
                return 0;

        member += ({ id });
        set(fname + "/member", member);

        save();

        ob = find_living(id);
        
        league = ([ "time"        : time(),
                    "league_name" : fname, 
                    "leader_id"   : me->query("league/leader_id"),
                    "leader_name" : me->query("league/leader_name") ]);

        ob->set("league", league);
        channels = ob->query("channels");
        if (! arrayp(channels) || ! sizeof(channels))
                  channels = ({ "inter" });
        else
        if (member_array("inter", channels) == -1)
                  channels += ({ "inter" });

        ob->set("channels", channels);
 
        return 1;
}

// 排序：升序
private int sort_hatred(string id1, string id2, mapping hatred)
{
        mixed *d1, *d2;

        if (! arrayp(d1 = hatred[id1]) || sizeof(d1) < 2 || ! intp(d1[1]))
                return -1;

        if (! arrayp(d2 = hatred[id2]) || sizeof(d2) < 2 || ! intp(d2[1]))
                return 1;

        return d1[1] - d2[1];
}

public string query_save_file() { return DATA_DIR "leagued"; }
