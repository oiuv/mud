// person used in quest

#include <ansi.h>

inherit CLASS_D("generate") + "/chinese";

int  accept_object(object who, object ob);

void random_move();
int  leave();
int  is_stay_in_room()  { return 1; }

void create()
{
        ::create();
        set("gender", random(5) ? "男性" : "女性");
        NPC_D->generate_cn_name(this_object());
        set("age", 30 + random(30));
        set("long", "");
        set("attitude", "friendly");
        set("chat_chance", 30);
        set("chat_msg", ({ (: random_move :) }));
        set("chat_chance_combat", 120);
        set("scale", 100);
        set("no_get", 1);

        set_temp("apply/armor", 100);
        set_temp("apply/damage", 15);
        set_temp("born_time", time());
        set_temp("dest_time", 1200 + time());

        add_money("silver", 10 + random(20));
        setup();

        if (clonep()) keep_heart_beat();
}
//独立于玩家气精内 by 大曾
void set_from_me(object me)
{
    // int exp;
    mapping my;
		int s, f, x, y, z;

    NPC_D->init_npc_skill(this_object(), NPC_D->get_exp(me));
    my = query_entire_dbase();
		s = this_object()->query_con() + this_object()->query_str();
		f = this_object()->query_int();
		z = (int)this_object()->query_skill("force", 1);

		my["max_jingli"] =  my["magic_points"] / 30 + f * 30;
		if (my["animaout"])
            my["max_jingli"] += my["max_jingli"] * 4 / 10;

		my["max_neili"] = z * 15 + my["con"] * 15;
		if (my["breakup"])
            my["max_neili"] += my["max_neili"] * 4 / 10;
		if (my["class"] == "bonze")
			my["max_neili"]  += 500;

        my["max_qi"]     = 100;
		my["max_qi"]    += (my["age"] - 14) * s * 2 / 3;
		my["max_qi"]    += (int)my["max_neili"] / 4;
		 // 太极神功配合道学心法加气
		if ((x = (int)this_object()->query_skill("taoism", 1)) > 39 &&
            (y = (int)this_object()->query_skill("taiji-shengong", 1)) > 39)
            {
                if (x > 350) x = (x - 350) / 2 + 350;
                if (y > 350) y = (y - 350) / 2 + 350;
                if (x > 200) x = (x - 200) / 2 + 200;
                if (y > 200) y = (y - 200) / 2 + 200;

                my["max_qi"] += (x + 100 ) * (y + 100) / 100;
            } else
			// 碧波神功配合碧海潮生曲加气
            if ((x = (int)this_object()->query_skill("bihai-chaosheng", 1)) > 39 &&
                (y = (int)this_object()->query_skill("bibo-shengong", 1)) > 39)
                {
                    if (x > 250) x = (x - 250) / 2 + 250;
                    if (y > 250) y = (y - 250) / 2 + 250;
                    if (x > 120) x = (x - 120) / 2 + 120;
                    if (y > 120) y = (y - 120) / 2 + 120;

                    my["max_qi"] += (x + 100 ) * (y + 100) / 100;
                }

            if (my["breakup"])
                my["max_qi"] += my["max_qi"];

		my["eff_qi"]     = my["max_qi"];
        my["qi"]         = my["max_qi"];

        my["max_jing"]   = 100;
		my["max_jing"]  += (my["age"] - 14) * s * 2 / 3;
		my["max_jing"]  += (int)my["max_jingli"] / 4;
		if (my["breakup"])
            my["max_jing"] += my["max_jing"];
		if (my["animaout"])
            my["max_jing"] += my["max_jing"];

        my["eff_jing"]   = my["max_jing"];
        my["jing"]       = my["max_jing"];
		my["eff_jingli"]   = my["max_jingli"];
        my["jingli"]       = my["max_jingli"];
        my["neili"]       = my["max_neili"];
        my["quest_count"] = me->query("quest_count");

		//修改20w-->50w by hong
        if (my["combat_exp"] > 500000 && random(100) < 5)
        {
                // 经验 > 500K，5%几率出现多个敌人
                set_temp("multi-enemy", 1);
        }

        if (my["combat_exp"] > 800000){
                my["jiali"] = query_skill("force") / 3;
        }
        else{
                my["jiali"] = query_skill("force") / 6;
        }
        if (query("place") == "西域")
                set_temp("dest_time", 900 + time());
        else
                set_temp("dest_time", 600 + time());
}

void kill_ob(object ob)
{
        int lvl;

        if (! is_busy())
                exert_function("powerup");

        if (ob->query("quest/id") != query("id"))
        {
                ::kill_ob(ob);
                return;
        }

		if (lvl = query_temp("multi-enemy"))
        {
                // 出现多个敌人
                delete_temp("multi-enemy");
                call_out("do_help_me", 1 + random(2), ob);
        }

        ::kill_ob(ob);
}
void do_help_me(object ob)
{
        if (! objectp(ob) || environment(ob) != environment() ||
	    ! living(ob))
                return;

        switch (random(3))
        {
        case 0:
                message_vision(HIW "\n$N" HIW "大声喝道：“好一个" +
                               ob->name(1) +
                               HIW "！各位，不要再等了，快出来帮" +
                               RANK_D->query_self(this_object()) +
                               "一把！”\n" NOR, this_object(), ob);
                break;

        case 1:
                message_vision(HIW "\n$N" HIW "忽然撮舌吹"
                               "哨，你听了不禁微微一愣。\n" NOR,
                               this_object());
                break;

        case 2:
                message_vision(HIW "\n$N" HIW "一声长啸，声音"
                               "绵泊不绝，远远的传了开去。\n" NOR,
                               this_object());
                break;
        }

        call_out("do_continue_help", 1 + random(4), ob);
}

void do_continue_help(object ob)
{
        int n;
        object *obs;

        if (! objectp(ob) || environment(ob) != environment())
                return;

        n = random(3) + 1;
        ob->set_temp("quest/help_count", n);
        message("vision", HIR "说时迟，那时快！突然转出" +
                          chinese_number(n) +
                          "个人，一起冲上前来，看来是早"
                          "有防备！\n" NOR, environment());

        // 生成帮手
        obs = allocate(n);
        while (n--)
        {
                obs[n] = new(CLASS_D("generate") + "/killed.c");
                NPC_D->set_from_me(obs[n], ob, 100);
                obs[n]->delete_temp("multi-enemy");
                obs[n]->set_temp("help_who", this_object());
                obs[n]->set_temp("is_helper", 1);
        }

        // 参与战斗 */
        set_temp("help_ob", obs);
        set_temp("help_count", sizeof(obs));
        obs->move(environment());
        obs->set_leader(this_object());
        obs->kill_ob(ob);
}
int filter_to_bonus(object ob, object aob)
{
        if (! playerp(ob) || ! living(ob) ||
            ! ob->is_killing(query("id")))
                // 必须是玩家并且参与屠杀我(NPC)
                return 0;

        // 协助的对象一致
        return (aob == ob->query_temp("quest/assist"));
}

// remove
void remove()
{
        object qob;

        if (objectp(qob = query_temp("quest_ob")))
                // 这个人已经消失了，取消相关联的任务
                destruct(qob);

        ::remove();
}



// 随即重新放置
void random_place(string msg)
{
        object old_env;
        object qob;
        string *not_place;
        string new_place;
        int limit;
        int qcount;

        // 如果原先创建了任务，就直接修改信息
        if (objectp(qob = query_temp("quest_ob")))
                qob->set("introduce", msg);
        else
                qob = new("/clone/quest/avoid");

        // 随即选择另外一个地方放置NPC
        old_env = environment();
        not_place = ({ query("place") });

        if (query("combat_exp") < 500000)
                not_place += ({ "大理一带" });

        if (query("combat_exp") < 800000)
                not_place += ({ "西域" });

        NPC_D->place_npc(this_object(), not_place);

        // 根据格式化消息生成结果
        msg = replace_string(msg, "$N", name(1));

        qcount = query("quest_count");
        if ((qcount < 100 || qcount >= 900) && random(10) ||
            (qcount >= 100 && qcount < 900) && random(50))
        {
                new_place = query("place");
                if (new_place == "西域")
                        limit = 1800;
                else
                        limit = 1200;
        } else
        {
                new_place = "很远的地方";
                limit = 1800;

                // 减少打听的价格
                set("ask_cheap", 3);
        }
        set_temp("dest_time", limit + time());
        msg = replace_string(msg, "PLACE",  new_place);

        // 初始化并记录这个任务
        qob->set("introduce", msg);
        qob->init_quest(name(1), old_env);
        set_temp("quest_ob", qob);

        return;
}

// 晕倒的时候有机会逃走
void unconcious()
{
        object *obs;
        object ob;
        mapping my;
        string msg;
        string quester;
        string gender;

        if (! query_temp("is_helper") && ! query_temp("help_ob"))
        {
                  if (random(100) < 8)
                {
                        // 10%几率逃走
                        switch (random(8))
                        {
                        case 0:
                                msg = HIC "$N" HIC "狂叫一声，狂吐几"
                                      "口鲜血，眼看就已不支，忽然一"
                                      "道黑影窜出，接连攻出数招，逼"
                                      "退$n" HIC "，只在这么一瞬间，"
                                      "此人已经扶起$N" HIC "，遁逃而"
                                      "走，竟然未留半点痕迹。\n" NOR;
                                break;
                        case 1:
                                msg = HIC "$N" HIC "摇摇欲坠，眼看就"
                                      "要跌倒，忽然口中喷出一口鲜血"
                                      "，$n" HIC "连忙侧身一避，就在"
                                      "此时，$N" HIC "奋然振作精神，"
                                      "提气一纵，竟然飘出十数丈之远"
                                      "，令人目瞪口呆！只见$N" HIC
                                      "刹间变做一个黑影，渐渐消失。"
                                      "\n" NOR;
                                break;
                        case 2:
                                msg = HIC "在$n" HIC "一阵狂攻之下，"
                                      "$N" HIC "只有招架之功，哪里还"
                                      "有还手之力？眼看就要命丧$n" HIC
                                      "之手，$N" HIC "忽然招式一变，"
                                      "精妙无方，竟是世上罕见！$n" HIC
                                      "略一疏神，已被$N" HIC "连环数"
                                      "招逼退，只见$N" HIC "迈开大步"
                                      "，逃遁而走。\n" NOR;
                                break;
                        case 3:
                                msg = HIC "只见$N" HIC "深吸一口气"
                                      "，神色略微好了一些，陡然迸发"
                                      "出惊天动地的一声大吼，直震得"
                                      "$n" HIC "发耳欲聩！仅这一霎"
                                      "，$N" HIC "身形一转，飘然退"
                                      "去，竟让$n" HIC "措手不及，"
                                      "追赶不上！\n" NOR;
                                break;
                        case 4:
                                msg = HIC "$n" HIC "连连进击，眼看"
                                      "便要得手，接连数招，让$N" HIC
                                      "已是避无可避，退无可退！$N"
                                      HIC "神色神色仓皇，急切间猛地"
                                      "咬中舌尖，“噗”的吐出！$n"
                                      HIC "只见眼前一阵红雾，待得雾"
                                      "散去，哪里还有$N" HIC "的影"
                                      "子？\n" NOR;
                                break;
                        case 5:
                                msg = HIC "$N" HIC "再退一步，却慢"
                                      "了小许，腿上早中招！一声惨"
                                      "呼，人已跌倒。$n" HIC "见状"
                                      "赶上前去，忽然眼前星光闪闪"
                                      "，仓皇下急退，只听有人哈哈"
                                      "大笑道：“$N" HIC "莫慌，我"
                                      "来也！”说罢又是一撒手，数"
                                      "十根银针飞出，待得$n" HIC
                                      "抵挡两下，那人早扶起$N" HIC
                                      "遁去了。\n" NOR;
                                break;
                        case 6:
                                msg = HIC "$N" HIC "晃了两下，忽然"
                                      "跌倒。$n" HIC "收住招式，笑道"
                                      "：“$N" HIC "，你……”话音未"
                                      "落，忽见$N" HIC "蓦的窜起，一"
                                      "招直奔$n" HIC "的要害，$n" HIC
                                      "大吃一惊！慌忙招架，只觉得内"
                                      "息紊乱，几欲呕吐！$N" HIC "也"
                                      "不追击，只是急奔而走，$n" HIC
                                      "连运几口气，去了胸前烦闷，却"
                                      "已不见$N" HIC "的踪影。\n" NOR;
                                break;
                        default:
                                msg = HIC "$N身负重伤，已然不敌，悲"
                                      "愤间只放声疾呼，一时震得$n"
                                      HIC "耳鼓欲破，攻势少缓。$N"
                                      HIC "猛然见到有机可乘，哪里肯"
                                      "放过，连出数招，杀出一条血路"
                                      "，就此不见。\n" NOR;
                                break;
                        }

                        clean_up_enemy();
                        obs = query_enemy();
                        if (sizeof(obs) > 0) ob = obs[0]; else ob = 0;
                        if (! objectp(ob))
                                msg = replace_string(msg, "$n", "众人");
                        message_sort("\n" + msg, this_object(), ob);

                        // 解除NPC的中毒状态
                        clear_condition(0);

                        // 恢复NPC的力气
                        my = query_entire_dbase();
                        my["eff_jing"] = my["max_jing"];
                        my["jing"]     = my["max_jing"];
                        my["eff_qi"]   = my["max_qi"] * 2 / 3;
                        my["qi"]       = my["eff_qi"];
                        my["neili"]    = my["max_neili"];
                        if (! intp(query_temp("escape_times")))
                                set_temp("escape_times", 1);
                        else
                                add_temp("escape_times", 1);
                        gender = (my["gender"] == "女性") ? "她" : "他";
                        // 登记一个任务，以便玩家可以追踪行迹
                        switch (random(9))
                        {
                        case 0:
                                msg = "听说$N被人打伤逃走，据说是躲到PLACE去了。";
                                break;
                        case 1:
                                msg = "听说$N和人动手，差点被打死，不过最"
                                      "后还是侥幸逃走了，好像去了PLACE。";
                                break;
                        case 2:
                                msg = "听说那$N和人一场血战，最后还是全身"
                                      "而退，好像是去了PLACE吧。";
                                break;
                        case 3:
                                msg = "$N听说是在PLACE啊，不过前一阵好像来过这里的。";
                                break;
                        case 4:
                                msg = "听说$N被人打死了吧？咦？不过听人说"
                                      "在PLACE也见过" + gender + "呀！";
                                break;
                        case 5:
                                msg = "这事我也不太清楚，不过听说" + gender + "好像在PLACE。";
                                break;
                        case 6:
                                msg = "你找" + gender + "干啥？" + gender + "不是在PLACE么？";
                                break;
                        case 7:
                                msg = "前两天" + gender + "还来过我们这儿呢，现在应该"
                                      "是去了PLACE吧。";
                        default:
                                msg = "$N呀，有人说在PLACE看到过" + gender + "，好像还受伤了。";
                                break;
                        }

                        random_place(msg);
                        remove_all_enemy(1);
                        return;
                }
        }

        if (stringp(quester = query_temp("quester")))
        {
                // 如果找到领取该quest的人
                if (objectp(ob = find_player(quester)))
                        ob->set_temp("quest/escape_times", query_temp("escape_times"));
        }
        ::unconcious();
}



// 当任务的NPC死亡的时候，检查是否可以进行奖励某些玩家。奖励
// 的对象：帮助任务者完成这个任务的所有人， 当然首先要求杀的
// 这个人是任务的完成对象，其次就是在这个场景中对该NPC下了杀
// 命令，并且协助了任务的完成者的玩家。
void die(object killer)
{
        object *obs;            // 场景中所有可以奖励的
        object dob;             // 打晕这个NPC的人
        object hob;             // 协助者
        object aob;             // 被协助者
        //int qlevel;             // 本次任务的等级
        int lvl;                // NPC的等级
        int scale;              // NPC呼叫的帮手和逃跑的次数
        int n;                  // 可以奖励的人的数目
        int exp;                // 需要瓜分的经验
        int pot;                // 需要瓜分的潜能
        int weiwang;            // 需要瓜分的威望
        int score;              // 需要瓜分的阅历
        int extra_exp;          // 打晕的人的额外经验
        int extra_pot;          // 打晕的人的额外潜能
        string quester;         // 需要完成这个任务的玩家ID
        object qob;             // 需要完成这个任务的玩家对象

        // 找到杀了我(NPC)或是打晕我的人
        if (! objectp(dob = killer))
                dob = query_defeated_by();

        if (objectp(dob) && dob->query_temp("owner"))
                dob = dob->query_temp("owner");

        while (1)
        {
                // 记录：此任务已经终止
                if (stringp(quester = query_temp("quester")))
                {
                        qob = UPDATE_D->global_find_player(quester);
                        if (qob->query("quest/id") == query("id"))
                                qob->set("quest/notice", "die");
                        UPDATE_D->global_destruct_player(qob, 1);
                }

                if (dob && dob->query("quest/id") == query("id"))
                        // 我自己打死的
                        break;

                if (dob) aob = dob->query_temp("quest/assist");
                if (aob && aob->query("quest/id") == query("id"))
                        // 我协助别人杀死的
                        break;

                // 非任务所有者或是任务所有者协助的人杀死，则记录之。
                CHANNEL_D->do_channel(this_object(), "rumor",
                                      sprintf("听说%s被人杀死了。", name()));
                log_file("static/killed_die", sprintf("%s %s(%s) died at %s because %s.\n",
                                                      log_time(), name(), query("id"),
                                                      environment()->short(),
                                                      dob ? sprintf("%s(%s)", dob->name(1), dob->query("id")) : "none"));

                break;
        }

        if (! aob) aob = dob;

        if (! aob)
        {
                // 没有找到 QUEST 的属主
                ::die();
                return;
        }

        // 察看目前正在杀我的人，是否也有值得奖励的
        obs = all_inventory(environment());
        obs = filter_array(obs, (: filter_to_bonus :), aob);

        if ((n = sizeof(obs)) > 0)
        {
                // 查找打晕我的人：不是杀死我的人
                dob = query_defeated_by();

                // 奖励多少呢？总共奖励供所有的人分，最后每
                // 人加上一点随机量，其中打晕这个人的玩家获
                // 得额外的一些奖励。
                lvl = NPC_D->check_level(this_object());
                exp = 15 + random(10) + lvl;
                pot = 9 + random(5) + lvl;
                weiwang = 8 + random(6) + lvl / 2;
                score = 9 + random(6) + lvl / 2;

                // 根据这个任务的等级进行奖励调整
                switch (aob->query("quest/level"))
                {
                case 1:
                        break;
                case 2:
                        exp += exp / 2;
                        pot += pot / 2;
                        weiwang += weiwang / 2;
                        score += score / 2;
                        break;
                case 3:
                        exp += exp;
                        pot += pot;
                        weiwang += weiwang;
                        score += score;
                        break;
                default:
                        exp = exp / 2 + 1;
                        pot = pot / 2 + 1;
                        weiwang = weiwang / 2 + 1;
                        score = score / 2 + 1;
                        break;
                }
                // 如果NPC呼叫了帮手，则可以获得额外经验
                if ((scale = sizeof(query_temp("help_count") +
                     query_temp("escape_times") * 2)) > 0)
                {
                        exp += exp * scale / 2;
                        pot += pot * scale / 2;
                }
                // 所有人均分经验：为什么除以n + 2？这是因为
                // 打晕我的人分两份经验，所以是n + 1，再加上
                // 领任务的这个人算1，那么就是n + 2。
                exp = exp / (n + 2) + 1;
                pot = pot / (n + 2) + 1;
                weiwang = weiwang / (n + 2) + 1;
                score = score / (n + 2) + 1;

                // 计算打晕我的额外奖励
                if (objectp(dob) && member_array(dob, obs) != -1)
                {
                        extra_exp = 1 + random(exp);
                        extra_pot = 1 + random(pot);
                        if (dob->query("combat_exp") < query("combat_exp") / 2)
                        {
                                // 出手的人武功比较低，获得的额外奖励多
                                extra_exp *= 2;
                                extra_pot *= 2;
                        } else
                        if (dob->query("combat_exp") > query("combat_exp") * 2)
                        {
                                // 出手的人武功太高，获得的额外奖励少
                                extra_exp /= 2;
                                extra_pot /= 2;
                        }
                }

                // 进行奖励
                foreach (hob in obs)
                {
                        // 调用延迟奖励，为什么这么调用？很简单，
                        // 因为我希望玩家在看到NPC死了以后才能够
                        // 看到奖励。
                        GIFT_D->delay_bonus(hob, ([ "exp"     : exp + random(4) +
                                                    ((hob == dob) ? extra_exp : 0),
                                                    "pot"     : pot + random(3) +
                                                    ((hob == dob) ? extra_pot : 0),
                                                    "weiwang" : weiwang + random(3),
                                                    "score"   : score + random(3),
                                                    "prompt"  : "击毙" + name() + "之后" ]));
                }
        }

        // 正常死亡
        ::die();

        return ;
}

int accept_fight(object ob)
{
        command("say 好！咱们就比划比划！");
        kill_ob(ob);
        return 1;
}

int accept_hit(object ob)
{
        command("say 你死去吧！");
        kill_ob(ob);
        return 1;
}

int accept_kill(object ob)
{
        command("say 哼！找死！");
        return 1;
}

void random_move()
{
        if (query_temp("is_helper"))
        {
                // is a helper
                if (! environment())
                {
                        // not in environment? unavaliable npc.
                        destruct(this_object());
                        return;
                }

                if (! query_temp("help_who"))
                {
                        // owner is killed. destruct this helper
                        if (! living(this_object()))
                                message_vision("$N缓缓的醒了过来。\n",
                                               this_object());

                        message_vision("$N看看四周，急匆匆的逃走了。\n",
                                       this_object());
                        destruct(this_object());
                        return;
                }

                // move with owner
                return;
        }

        if (time() > query_temp("dest_time"))
        {
                message_vision("$N急急忙忙的走了。\n", this_object());
                CHANNEL_D->do_channel(this_object(), "rumor",
                                      sprintf("听说%s隐居到了深山老泽，从此不再出没在世间。", name()));
                log_file("static/killed_die", sprintf("%s %s(%s) vanished because timeout(%d:%d).\n",
                                                      log_time(), name(), query("id"),
                                                      time() - query_temp("born_time"),
                                                      query_temp("dest_time") - query_temp("born_time")));
                destruct(this_object());
                return;
        }
          NPC_D->random_move(this_object());
}
