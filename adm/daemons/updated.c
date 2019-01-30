// updated.c
// write by Doing Lu for user management
// because a user may does much association with others,
// so I must assure all the data keep consistant

// #pragma optimize
// #pragma save_binary

#include <ansi.h>
#include <room.h>

inherit F_SAVE;

// data need save
mixed title_base;

string query_save_file() { return DATA_DIR "pinfo"; }

void remove_title(object ob);
void set_title(object ob);
object global_find_player(string user);
void global_destruct_player(object ob, int raw);

void create()
{
        seteuid(getuid());
        restore();

        if (arrayp(title_base))
                title_base = filter_array(title_base, (: arrayp($1) && sizeof($1) == 2 :));
        else
                title_base = 0;
}

#define LUBAN           "/adm/npc/luban"
#define RING_DIR        "/data/item/ring/"

// check the user's data when login
void check_user(object ob)
{
	mapping my;
        mapping skill_status;
        string *sname;
        int combat_exp;
        int level;
        int i;
	mapping party;

	my = ob->query_entire_dbase();

	if (ob->query("family/generation") == 0)
		ob->delete("family");

	if (ob->query("gender") == "无性")
		ob->set("class", "eunach");

        if ((int)ob->query("combat/today/which_day") != time() / 86400)
                ob->delete("combat/today");

	if (mapp(party = my["party"]) && stringp(party["party_name"]))
		party["party_name"] = filter_color(party["party_name"]);

        // 记录名字
        NAME_D->map_name(ob->query("name"), ob->query("id"));

        // 重新设置运行计时器
        reset_eval_cost();

        // 赋予称号
        set_title(ob);

        // 更新 killer 的信息
        ob->update_killer();

	if (wizardp(ob)) return;

	if (undefinedp(my["eff_jing"]))  my["eff_jing"] = my["max_jing"];
	if (undefinedp(my["eff_qi"])) my["eff_qi"] = my["max_qi"];
	if (my["eff_jing"] > my["max_jing"]) my["eff_jing"] = my["max_jing"];
	if (my["eff_qi"] > my["max_qi"]) my["eff_qi"] = my["max_qi"];
	if (my["jing"] > my["eff_jing"]) my["jing"] = my["eff_jing"];
	if (my["jing"] > my["eff_jing"]) my["jing"] = my["eff_jing"];
	if (my["neili"] > my["max_neili"] * 2) my["neili"] = my["max_neili"] * 2;

	combat_exp = (int)ob->query("combat_exp");
	if (! mapp(skill_status = ob->query_skills())) return;
	sname  = keys(skill_status);

	for (i = 0; i < sizeof(skill_status); i++)
	{
		level = skill_status[sname[i]];
                if (file_size(SKILL_D(sname[i]) + ".c") == -1)
                {
                        tell_object(ob, "No such skill:" + sname[i] + "\n");
                        continue;
                }

                if (SKILL_D(sname[i])->type() == "martial")
                {
            		while (level &&
			       (level - 1) * (level -1 ) * (level - 1) / 10 > combat_exp)
            		       level--;

            		ob->set_skill(sname[i], level);
                }
	}
}

// clear the user's data
// when catalog parameter equal to "all", I will remove all
// the informatino of this user. This may be used when the
// user was purged.
string clear_user_data(string user, string cat)
{
        object login_ob;
        object ob;
        string couple_id;
        string path, file_name;
        string *dirs;
        object temp;
        string brothers;
        string bro_id;
        mapping bro;
        int flag;
        int i;

        // only root uid can does it
        if (previous_object() &&
            getuid(previous_object()) != ROOT_UID &&
            geteuid(previous_object()) != user)
                return "你无权清除该玩家的数据。\n";

        // find the user's body
        seteuid(getuid());
        login_ob = 0;
        ob = find_player(user);
        if (! ob)
        {
                login_ob = new(LOGIN_OB);
                login_ob->set("id", user);
		ob = LOGIN_D->make_body(login_ob);
                if (! ob)
                {
                        catch(destruct(login_ob));
                        return "暂时无法生成玩家对象。\n";
                }

		if (! ob->restore())
                {
                        catch(destruct(login_ob));
                        catch(destruct(ob));
                        return "没有这个玩家。\n";
                }

        	ob->setup();
        }

        // no catalog? treat it as "all"
        if (! cat) cat = "all";
        flag = 0;

        // remove name information
        if (cat == "name" || cat == "all")
                NAME_D->remove_name(ob->query("name"), ob->query("id"));

        // remove room information
        if ((cat == "room" || cat == "all") &&
            mapp(ob->query("private_room")))
        {
                // Demolish the room of the user
                LUBAN->demolish_room(ob);
                flag++;
        }

        // remove marriage information
        if ((cat == "couple" || cat == "all") &&
            mapp(ob->query("couple")))
        {
                // clear the couple infomation

                // remove the ring
                file_name = RING_DIR + ob->query("id");
                if (file_size(file_name + ".c") > 0)
                {
                        if (temp = find_object(file_name))
                        {
                                if (environment(temp))
                                {
                                        message("vision", HIM + temp->name() +
                                                HIM "忽然化作一缕清烟，不见了！\n" NOR,
                                                environment(temp));
                                }
                        }
                        DBASE_D->clear_object(file_name);
                }

                couple_id = ob->query("couple/id");
                ob->delete("couple");
                ob->delete("can_summon/wedding ring");
                flag++;
                if (couple_id) clear_user_data(couple_id, "couple");
        }

        // remove item information
        if (cat == "item" || cat == "all")
        {
                object item;
                // clear the all item
                path = ITEM_DIR + ob->query("id")[0..0] + "/";
                dirs = get_dir(path + ob->query("id") + "-*");
                for (i = 0; i < sizeof(dirs); i++)
                {
                        file_name = path + dirs[i];
                        if ((item = find_object(file_name)) &&
                            environment(item))
                        {
                                message("vision", HIM + item->name() +
                                        "忽然化作一股轻烟，不见了！\n" NOR,
                                        environment(item));
                        }
                        DBASE_D->clear_object(file_name);
                        rm(file_name);
                }
        }

        // remove board information
        if (cat == "board" || cat == "all")
        {
                object *rooms;
                rooms = filter_array(children(CHAT_ROOM),
                                     (: clonep($1) && $1->query("owner_id") == $(user) :));
                for (i = 0; i < sizeof(rooms); i++)
                        destruct(rooms[i]);
                file_name = DATA_DIR + "board/chatroom_" + user + __SAVE_EXTENSION__;
                rm(file_name);
        }

        // remove haterd information
        if (cat == "hatred" || cat == "all")
        {
                // remove the hatred information about the
                // familys & leagues to this player
                FAMILY_D->remove_hatred(ob->query("id"));
                LEAGUE_D->remove_hatred(ob->query("id"));
        }

        // remove brothers information
        if (mapp(bro = ob->query("brothers")) &&
            (sscanf(cat, "brothers:%s", brothers) == 1 || cat == "all"))
        {
                // remove all the brothers information
                if (cat == "all") brothers = "all";

                // here, I remove the brothers information of
                // ob, when brothers equal to "all", then I
                // will remove all brothers for this ob, Does it
                // cause a BUG? I won't, because the ID "all"
                // can not be registered for this MUD.
                if (brothers == "all")
                {
                        foreach (bro_id in keys(bro))
                                // remove my brother's data for me
                                clear_user_data(bro_id, "brothers:" + ob->query("id"));

                        ob->delete("brothers");
                } else
                if (! undefinedp(bro[brothers]) != -1)
                {
                        // remove this brother
                        map_delete(bro, brothers);
                        if (sizeof(bro) < 1)
                                ob->delete("brothers");
                        else
                                ob->set("brothers", bro);
                }
                flag++;
        }

        // remove league information
        if (cat == "league" || cat == "all")
        {
                // remove the user's league info
                LEAGUE_D->remove_member_from_league(ob);
                ob->delete("league");
        }

        // remove title information
        if (cat == "title" || cat == "all")
                remove_title(ob);

        // save the data of the user
        if (flag) ob->save();

        // Destrut the object if create temporate
        if (login_ob)
        {
                catch(destruct(login_ob));
                catch(destruct(ob));
        }

        return "成功。\n";
}

// remove an user
string remove_user(string user)
{
        object ob;
        string result;

        // destruct the user object
        if (ob = find_player(user))
        {
                if (ob->query_temp("link_ob"))
                        catch(destruct(ob->query_temp("link_ob")));
                catch(destruct(ob));
        }

        // Remove the user from wizlist if the user was wizard
        SECURITY_D->set_status(user, "(player)");

        // clear the data of user first
        result = clear_user_data(user, "all");

        // remove the file of the user
	rm(DATA_DIR + "login/" + user[0..0] + "/" + user + __SAVE_EXTENSION__);
	rm(DATA_DIR + "user/" + user[0..0] + "/" + user + __SAVE_EXTENSION__);
}

// user born
void born_player(object me)
{
        mixed files;
        int i;
        string special;
        string msg;

        msg = HIG "你与生俱来的技能有：" NOR;

        // 查看所有的特殊技能文件
        files = get_dir("/kungfu/special/");
        me->delete("special_skill");

        if (sizeof(files))
        {
                // 整理所有的技能文件
                for (i = 0; i < sizeof(files); i++)
                        sscanf(files[i], "%s.c", files[i]);

                // 特殊先天属性先行排除
                files -= ({ "lighting" });
                // 去除转世特技
                files -= ({ "guibian", "guimai", "jinshen", "piyi",
                   "qinzong", "wuxing", "shenyan","tiandao"});

                // 性格不符不会愤怒之心
                if (me->query("character") != "光明磊落"
                   && me->query("character") != "心狠手辣")
                        files -= ({ "wrath" });

                // 先天膂力 < 26 不会麒麟血臂
                if (me->query("str") < 26)
                        files -= ({ "strength" });

                // 先天悟性 < 26 不会罡睿神慧
                if (me->query("int") < 26)
                        files -= ({ "intellect" });

                // 先天根骨 < 26 不会镇蕴七星
                if (me->query("con") < 26)
                        files -= ({ "constitution" });

                // 先天身法 < 26 不会玲珑玉躯
                if (me->query("dex") < 26)
                        files -= ({ "dexterity" });

                // 先天容貌 < 20 不会天颜永驻
                if (me->query("per") < 20)
                        files -= ({ "youth" });


                 // 先天悟性 < 26 不会天赋聪颖
                if (me->query("int") < 26)
                        files -= ({ "clever" });

                // 获得第一项技能
                special = files[random(sizeof(files))];
                me->set("special_skill/" + special, 1);

                msg += SPECIAL_D(special)->name();

                files -= ({ special });
                // 百分百第二特技
                if (sizeof(files) && random(2) < 10)
                {
                        // 获得第二项技能
                        special = files[random(sizeof(files))];
                        me->set("special_skill/" + special, 1);
                        msg += HIG "、" NOR + SPECIAL_D(special)->name();

                        files -= ({ special });
                        // 百分百第三特技
                        if (sizeof(files) && random(3) < 10)
                        {
                                // 获得第三项技能
                                special = files[random(sizeof(files))];
                                me->set("special_skill/" + special, 1);
                                msg += HIG "及" NOR + SPECIAL_D(special)->name();
                        }
                }

                // 麒麟血臂增加1点膂力
                if (me->query("special_skill/strength"))
                        me->add("str", 2);

                // 罡睿神慧增加1点悟性
                if (me->query("special_skill/intellect"))
                        me->add("int", 2);

                // 镇蕴七星增加1点根骨
                if (me->query("special_skill/constitution"))
                        me->add("con", 2);

                // 玲珑玉躯增加1点身法
                if (me->query("special_skill/dexterity"))
                        me->add("dex", 2);

                msg += HIG "。\n" NOR + HIC "如果你对此有任何疑问，可以重新"
                       "阅读天赋属性(" HIY "help gift" NOR + HIC ")介绍。\n"
                       NOR;
                me->start_call_out((: call_other, __FILE__, "notice_player",
                                      me, msg :), 0);
        }
}

// 转世重生 by 薪有所属
void zhuan_player(object me)
{
        mixed files;
        string special;
        string msg;
        string *skills;
        mapping all_skills;
        int i;
        string menpai1;

        if (me->query("gender") == "无性")
                me->set("gender", "男性");


//转世清除记录delete
        me->delete("couple");                // 家庭记录
        me->delete("sex");                   // 做爱记录
        me->delete("brothers");              // 结拜兄弟
        me->delete("bunch");                 // 帮派记录
        me->delete("league");                // 同盟记录
        //me->delete("family");                // 门派记录
        me->delete("class");                 // 称号记录
        me->delete("detach");                // 脱离记录
        me->delete("betrayer");              // 叛师记录
        me->delete("long");                  // 个人描述

        me->delete("combat");                // PK  记录
        me->delete("animaout");              // 元婴出世
        me->delete("breakup");               // 任督二脉
        me->delete("can_learn");             // 技能解密
        me->delete("can_make");              // 制药记录

        me->delete("env");                   // 个人设定
        me->delete("gift");                  // 吃丹记录（含九转）
        me->delete("opinion");               // 评价记录
        me->delete("opinions");              // 宗师身份
        me->delete("out_family");            // 出师历练

        me->delete("quest");					// 门派任务
        me->delete("quest_count");           // 门派任务
        me->delete("map");                   // 地图标志
        me->delete("rumor");                 // 事件记录
        me->delete("schedule");              // 计划记录
        me->delete("skybook");               // 天书记录（三丹记录）

        me->delete("luohan_winner");         //过阵记录
        me->delete("story");                 // 中的故事

        me->delete("DiZangPass");            // 转世任务
        me->delete("HellZhenPass");          // 转世任务
        me->delete("SkyPass");               // 转世任务
        me->delete("over_quest");            // 转世任务

        //获取转生前门派，用于脱离时无损判断 by 薪有所属
        menpai1 = me->query("family/family_name");
        me->set("old_family_name",menpai1);
        me->delete("family");                // 门派记录

        //转世set
        me->set("title", "普通百姓");        // 个人称号
        me->set("character", "国士无双");    // 转世性格
        //补充 by 薪有所属
        me->delete("tattoo");                   // 刺青记录
        me->delete("special_skill");            // 特技记录
        me->delete("can_learned");             // 技能解密2(太玄)
        me->delete("mirror_task");             // task记录
        me->delete("mirror_count");             // task记录

        me->delete("death");                  // 生死玄关

        me->delete("can_perform");         //武功绝招

        me->delete("learned_literate");        //学过读书写字

        me->set("gongxian",0);                  //贡献清零
        me->set("score",0);                  //阅历清零
        me->set("weiwang",0);                  //威望清零
        me->set("experience",0);             //体会清零
        me->set("learned_experience",0);     //体会清零

        me->set("max_neili",0);                  //内力清零
        me->set("neili",0);                  //内力清零
        me->set("jiali",0);

        me->set("max_jingli",0);                  //精力清零
        me->set("jingli",0);                    //精力清零
        me->set("jiajing",0);                  //精力清零

        me->set("shen",0);                  //神清零
        me->set("combat_exp",0);           //经验清零
        me->set("learned_points",0);       //潜能清零
        me->set("potential",0);       //潜能清零
        me->set("magic_learned",0);      //灵慧清零
        me->set("magic_points",0);      //灵慧清零



        //me->set("static/marry",0);      //黯然记录
        //me->set("static/sadly",0);      //黯然记录
        me->delete("static");//黯然记录

        //hp set
        me->set("max_qi", 100);
        me->set("eff_qi", me->query("max_qi"));
        me->set("qi", me->query("eff_qi"));
        me->set("max_jing", 100);
        me->set("eff_jing", me->query("max_jing"));
        me->set("jing", me->query("eff_jing"));

        me->set("mud_age", 0);
        me->set("age", 14);
        me->set("birthday", time());

        all_skills = me->query_skills();

        //判断是否有技能，有技能才清除技能。否则没技能时原清除技能代码会报错。 by 薪有所属
        //虽说正常转世肯定不会0技能，但完全可以最后一步放弃所有技能。。。
        if (all_skills)
        {
        skills = keys(all_skills);
        //skills清零
        for (i = 0; i < sizeof(skills); i++)
                me->delete_skill(skills[i]);
        }
        me->set("reborn", 1);

        if (me->is_ghost()) me->reincarnate();
        me->reset_action();

        msg = HIG "你获得的转世技能有：" NOR;

        // 查看所有的转世特殊技能文件
        files = ({ "guibian", "guimai", "jinshen", "piyi",
                   "qinzong", "wuxing", "shenyan","tiandao",
                });

          //转世固定赠送神眼特技，故随机时神眼特技先行排除
          files -= ({ "shenyan" });

          //转世先天悟性小于16时直接赠送互搏特技，先天悟性在16（含）至25（含）之间时有机率随机到互搏特技
          //先天悟性26（含）以上时不会随机到互搏特技 by 薪有所属
         if (me->query("int") < 16 || me->query("int") > 25)
         	files -= ({ "tiandao" });

         	//转世先天悟性小于35点不会随机到count特技 by 薪有所属
         if (me->query("int") < 35)
         	files -= ({ "qinzong" });

         	//转世int<22或dex<26,极限也无法达到葵花要求时不给鬼脉特技 2017-03-29
         if (me->query("int") < 22 || me->query("dex") < 26)
         	files -= ({ "guimai" });

        // 获得第一项技能
        special = files[random(sizeof(files))];
        me->set("special_skill/" + special, 1);
        msg += SPECIAL_D(special)->name();

        message("channel:rumor", HIR "【转世重生】" + me->query("name") +
                "获得转世技能--" + SPECIAL_D(special)->name() + HIR "！\n" NOR, users());

        files -= ({ special });

        special = files[random(sizeof(files))];
        me->set("special_skill/" + special, 1);
        msg += HIG "、" NOR + SPECIAL_D(special)->name();

        message("channel:rumor", HIR "【转世重生】" + me->query("name") +
                "获得转世技能--" + SPECIAL_D(special)->name() + HIR "！\n" NOR, users());

        if (me->query("int") < 16)
       	me->set("special_skill/tiandao", 1);
       	else
        me->set("special_skill/clever", 1);

        if (me->query("per") < 20)
        me->set("per",20);

        me->set("special_skill/youth", 1);
        me->set("special_skill/shenyan", 1);
        me->set("special_skill/wrath", 1);
        //加大转世福利，增加赠送2特技 2017-01-31
        me->set("special_skill/self", 1);
        me->set("special_skill/divine", 1);

       if (me->query("int") < 16)
       	msg += HIG "、" NOR + HIG "天道酬勤" NOR + HIG "、" NOR + HIG "天颜永驻" NOR + HIG "、" NOR + HIC "通慧神眼" NOR + HIG "、" NOR + HIR "愤怒之心" NOR + HIG "、" NOR + HIC "周天运转" NOR + HIG "、" NOR + HIR "移经易脉" NOR;
       	else
        msg += HIG "、" NOR + HIM "天赋聪颖" NOR + HIG "、" NOR + HIG "天颜永驻" NOR + HIG "、" NOR + HIC "通慧神眼" NOR + HIG "、" NOR + HIR "愤怒之心" NOR + HIG "、" NOR + HIC "周天运转" NOR + HIG "、" NOR + HIR "移经易脉" NOR;

        msg += HIG "。\n" NOR;

        if (me->query("int") < 16)
        message("channel:rumor", HIR "【转世重生】" + me->query("name") +
                "获得转世技能--" + HIG "天道酬勤" NOR + HIR "！\n" NOR, users());
        else
        message("channel:rumor", HIR "【转世重生】" + me->query("name") +
                "获得转世技能--" + HIM "天赋聪颖" NOR + HIR "！\n" NOR, users());

        message("channel:rumor", HIR "【转世重生】" + me->query("name") +
                "获得转世技能--" + HIG "天颜永驻" NOR + HIR "！\n" NOR, users());

        message("channel:rumor", HIR "【转世重生】" + me->query("name") +
                "获得转世技能--" + HIC "通慧神眼" NOR + HIR "！\n" NOR, users());

        message("channel:rumor", HIR "【转世重生】" + me->query("name") +
                "获得转世技能--" + HIR "愤怒之心" NOR + HIR "！\n" NOR, users());

        message("channel:rumor", HIR "【转世重生】" + me->query("name") +
                "获得转世技能--" + HIC "周天运转" NOR + HIR "！\n" NOR, users());

        message("channel:rumor", HIR "【转世重生】" + me->query("name") +
                "获得转世技能--" + HIR "移经易脉" NOR + HIR "！\n" NOR, users());

        message("channel:rumor", HIR "【转世重生】恭喜" + me->query("name") +
                "得到人神魔三界庇佑，元神转世重生！\n" NOR, users());

        me->start_call_out((: call_other, __FILE__,
                           "notice_player", me, msg :), 0);
}




// notice user a piece of message, delay call by born user
void notice_player(object me, string msg)
{
        tell_object(me, msg);
}

// query title dbase
mixed query_title_base()
{
        if (! is_root(previous_object()))
                return 0;

        return title_base;
}

// set title dbase
mixed set_title_base(mixed ts)
{
        if (! is_root(previous_object()))
                return 0;

        title_base = ts;
}

// 清除某个玩家的 title
void remove_title(object ob)
{
        int i;

        if (! arrayp(title_base) || ! ob->query("granted_title"))
                return;

        ob->delete_temp("title");
        ob->delete("granted_title");

        for (i = 0; i < sizeof(title_base); i++)
        {
                // 搜索所有的 title
                if (title_base[i][1] == ob->query("id"))
                        // 去掉title
                        title_base[i][1] = 0;
        }
        save();
        return;
}

// 设置某个玩家的 title
void set_title(object ob)
{
        string id;
        int i;

        if (! arrayp(title_base) || ! ob->query("granted_title"))
                return;

        id = ob->query("id");
        for (i = 0; i < sizeof(title_base); i++)
                if (title_base[i][1] == id)
                {
                        // 加上title
                        ob->set_temp("title", title_base[i][0]);
                        return;
                }

        // 这个用户并没有分配的称号
        ob->delete("granted_title");
}

// 寻找或调入某一个玩家
// 如果程序处理中需要更新那些不在线的玩家，则可以使用该函数
// 将这个玩家调入并且进行修改，请注意：修改完毕以后程序必须
// 保存玩家，并且使用 global_destruct_player 将玩家析构，如
// 果没有调用这个函数，则赋予玩家的定时器会自动析构玩家。
object global_find_player(string user)
{
        object ob;
        object login_ob;

        ob = find_player(user);
        if (! ob)
        {
                login_ob = new(LOGIN_OB);
                login_ob->set("id", user);
		ob = LOGIN_D->make_body(login_ob);
                if (! ob)
                {
                        catch(destruct(login_ob));
                        return 0;
                }

		if (! ob->restore())
                {
                        catch(destruct(login_ob));
                        catch(destruct(ob));
                        return 0;
                }

        	ob->set_temp("temp_loaded", 1);
                ob->start_call_out(bind((: call_other, __FILE__, "global_destruct_player", ob, 0 :), ob), 0);
                catch(destruct(login_ob));
        }

        return ob;
}

// 析构一个被 UPDATE_D 调入的玩家
void global_destruct_player(object ob, int raw)
{
        if (objectp(ob) && ob->query_temp("temp_loaded"))
        {
                if (raw) ob->save();
                destruct(ob);
        }
}
