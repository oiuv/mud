// punish the berays user
#include <ansi.h>

// #pragma optimize
// #pragma save_binary

inherit F_DBASE;

void create()
{
        seteuid(ROOT_UID);
        set("channel_id", "执法精灵");
        CHANNEL_D->do_channel( this_object(), "sys", "执法精灵已经启动。");
        remove_call_out("monitor");
        call_out("monitor", 1);
}

int clean_up() { return 1; }

void family_punish();

string *punishers = ({
        CLASS_D("xiakedao") + "/zhangsan",
        CLASS_D("xiakedao") + "/lisi",
});

string *catchers = ({
        CLASS_D("misc") + "/zhang",
});

mapping family_punishers = ([
        "武当派"   : ({ CLASS_D("misc") + "/chongxu" }),
        "少林寺"   : ({ CLASS_D("misc") + "/fangsheng" }),
        "华山派"   : ({ CLASS_D("misc") + "/murenqing" }),
        "峨嵋派"   : ({ CLASS_D("misc") + "/guoxiang" }),
        "桃花岛"   : ({ CLASS_D("misc") + "/taogu" }),
        "神龙教"   : ({ CLASS_D("misc") + "/zhong" }),
        "丐帮"     : ({ CLASS_D("misc") + "/wangjiantong" }),
        "古墓派"   : ({ CLASS_D("misc") + "/popo" }),
        "全真教"   : ({ CLASS_D("misc") + "/laodao" }),
        "星宿派"   : ({ CLASS_D("misc") + "/xiaoxian" }),
        "逍遥派"   : ({ CLASS_D("misc") + "/liqiushui" }),
        "大轮寺"   : ({ CLASS_D("misc") + "/laoseng" }),
        "血刀门"   : ({ CLASS_D("misc") + "/hongri" }),
        "灵鹫宫"   : ({ CLASS_D("misc") + "/tonglao" }),
        "红花会"   : ({ CLASS_D("misc") + "/yuwanting" }),
        "慕容世家" : ({ CLASS_D("misc") + "/furen" }),
        "欧阳世家" : ({ CLASS_D("misc") + "/laonu" }),
        "关外胡家" : ({ CLASS_D("misc") + "/huyidao" }),
        "段氏皇族" : ({ CLASS_D("misc") + "/duansh" }),
]);

void monitor()
{
        int i;
        object *obs;
        string *aviable;
        string punisher;
//      string catcher;
        string msg;

        remove_call_out("monitor");
        call_out("monitor", 180 + random(60));

        if (VERSION_D->is_boot_synchronizing())
                // 正在启动中同步版本？那么不启动惩罚系统
                return;

	// when the pking was going, I won't let the punisher out,
	// because the competitor may in PKD.
	if (PK_D->is_pking())
		return;

        CHANNEL_D->do_channel(this_object(), "sys",
			      "各大门派扫描所有在线玩家。");

        // search all the player for punishing
        obs = filter_array(users(),
			   (: $1->query("combat_exp") >= 100000 &&
		              $1->query("combat/need_punish") &&
                              ! $1->is_in_prison() &&
			      ! $1->is_ghost() &&
                              ! wizardp($1) &&
			      environment($1) :));

	if (sizeof(obs))
        {
        	obs = sort_array(obs, (: $2->query("combat_exp") -
        			         $1->query("combat_exp") :));
                aviable = filter_array(punishers, (: ! find_object($1) :));
                i = 0;
                while (sizeof(aviable) && i < sizeof(obs))
                {
                        msg = obs[i]->query("combat/need_punish");
                        punisher = aviable[random(sizeof(aviable))];
                        punisher->start_punish(obs[i], msg);
                        aviable -= ({ punisher });
                        i++;
                }
        }

        // search all the player for catching
        obs = filter_array(users(),
			   (: $1->query("combat_exp") < 300000 &&
                              $1->query_condition("killer") &&
			      ! $1->is_ghost() &&
                              ! $1->is_in_prison() &&
                              ! wizardp($1) &&
			      environment($1) :));

	if (sizeof(obs))
        {
        	obs = sort_array(obs, (: $2->query("combat_exp") -
        			         $1->query("combat_exp") :));
                aviable = filter_array(catchers, (: ! find_object($1) :));
                i = 0;
                while (sizeof(aviable) && i < sizeof(obs))
                {
                        punisher = aviable[random(sizeof(aviable))];
                        punisher->start_catch(obs[i]);
                        aviable -= ({ punisher });
                        i++;
                }
        }

        // Normal I won't check the player
        if (random(10) == 0 || 1)
                family_punish();
}

void family_punish()
{
        object ob;
        object *obs;
        mapping betrayer;
        string *punishers;
        string punisher;
        string key;

        obs = filter_array(users(), (: $1->query("combat_exp") >= 100000 &&
                                       ! environment($1)->query("no_fight") &&
                                       mapp($1->query("betrayer")) :));

        if (! sizeof(obs))
                return;

        foreach (ob in obs)
        {
                betrayer = ob->query("betrayer");
                foreach (key in keys(betrayer))
                {
                        if (key == "times") continue;
                        if (! arrayp(punishers = family_punishers[key]))
                        {
                                ob->add("detach/" + key, 1);
                                ob->add("detach/times", 1);
                                betrayer["times"] -= betrayer[key];
                                map_delete(betrayer, key);
                                if (betrayer["times"] < 1)
                                        ob->delete("betrayer");
                                continue;
                        }

                        punishers = filter_array(punishers, (: ! find_object($1) :));
                        if (! sizeof(punishers))
                                // No punishers aviable now
                                continue;

                        punisher = punishers[random(sizeof(punishers))];
			if (file_size(punisher + ".c") < 0)
			{
				log_file("static/log", "can not find punisher: "
					 + punisher + "\n");
				break;
			}
                        punisher->start_punish(ob, key);
                        break;
                }
        }
}