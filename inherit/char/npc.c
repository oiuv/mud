// npc.c
// Update by Vin for Heros.cn

#include <command.h>

inherit CHARACTER;
inherit F_CLEAN_UP;

void scan();
int  chat();
int  heal_self();
int  exert_function(string func);

object carry_object(string file)
{
        object ob;

        if (! objectp(ob = new(file))) return 0;
        ob->move(this_object());
        return ob;
}

object add_money(string type, int amount)
{
        object ob;

        ob = carry_object("/clone/money/" + type);
        if (! ob) return 0;
        ob->set_amount(amount);
}

int accept_fight(object who)
{
        string att;
        int perqi;
        int perjing;

        if (! query("can_speak"))
        {
                kill_ob(who);
                return 1;
        }

        if (this_object()->is_guarder())
                return this_object()->check_enemy(who, "fight");

        att = query("attitude");
        perqi = (int)query("qi") * 100 / query("max_qi");
        perjing = (int)query("jing") * 100 / query("max_jing");

        if (is_fighting())
        switch(att)
        {
                case "heroism":
                if (perqi >= 50)                
                {
                        command("say 哼！出招吧！");
                        return 1;
                } else
                {
                        command("say 哼！我小歇片刻再收拾你不迟。");
                        return 0;
                }
                        break;
                default:
                        command("say 想倚多为胜，这不是欺人太甚吗！");
                        return 0;
        }

        if (perqi >= 75 && perjing >= 75)
        {
                switch (att)
                {
                case "friendly":
                        command("say " + RANK_D->query_self(this_object())
                                + "怎么可能是" + RANK_D->query_respect(who)
                                + "的对手？");
                        return 0;
                case "aggressive":
                case "killer":
                        command("say 哼！出招吧！");
                        break;
                default:
                        command("say 既然" + RANK_D->query_respect(who)
                                + "赐教，" + RANK_D->query_self(this_object())
                                + "只好奉陪。");
                        break;
                }
                return 1;
        }

        command("say 今天有些疲惫，改日再战也不迟啊。");
        return 0;
}

int accept_hit(object who)
{
        int t;
        string att;
        int perqi;
        int perjing;

        if (! query("can_speak"))
        {
                kill_ob(who);
                return 1;
        }

        if (this_object()->is_guarder())
                return this_object()->check_enemy(who, "hit");

        att = query("attitude");
        perqi = (int)query("qi") * 100 / query("max_qi");
        perjing = (int)query("jing") * 100 / query("max_jing");

        add_temp("attempt_hit", 1);
        t = query_temp("attempt_hit");

        if (perqi >= 50 && perjing >= 50)
        {
                switch(att)
                {
                case "friendly":
                        command("say 这位" + RANK_D->query_respect(who)
                                + "，且慢！");
                        break;
                case "aggressive":
                        if (random(t) > 8)
                        {
                                command("say 他奶奶的，怎么这么烦？就让" +
                                        RANK_D->query_self_rude(this_object()) +
                                        "开开杀戒！");
                                kill_ob(who);
                                return 1;
                        }
                        command("say 好个" + RANK_D->query_rude(who) +
                                "，接招！");
                        break;
                case "killer":
                        if (random(t) > 2)
                        {
                                command("say 哼，找死找到这里来了，" +
                                        RANK_D->query_self_rude(this_object()) +
                                        "手正痒呢！");
                                kill_ob(who);
                                return 1;
                        }
                        command("say 接招吧！");
                        break;
                default:
                        if (random(t) > 7)
                        {
                                command("say 你要找死啊！");
                                kill_ob(who);
                                return 1;
                        }
                        command("say 这位" + RANK_D->query_respect(who)
                                + "，且慢！");
                        break;
                        switch (random(3))
                        {
                        case 0:
                                command("say 来来来！");
                                break;
                        case 1:
                                command("say 那就较量较量！");
                                break;
                        case 2:
                                command("say 来吧！我还会怕了你不成？");
                                break;
                        }
                        break;
                }
        } else
        {
                switch(att) {
                case "friendly":
                        command("say 既然" + RANK_D->query_respect(who)
                                + "如此无礼，我只有不容情了！");
                        break;
                case "aggressive":
                case "killer":
                        command("say " + RANK_D->query_rude(who) +
                                "！你找死。");
                        break;
                default:
                        command("say 你不仁，我不义！" + RANK_D->query_rude(who) +
                                "，可不要怪我。");
                        break;
                }
                this_object()->kill_ob(who);
        }

        return 1;
}

int accept_kill(object who)
{
        if (! living(this_object()))
                return 1;

        if (! query("can_speak"))
        {
                kill_ob(who);
                return 1;
        }

        if (this_object()->is_guarder())
                return this_object()->check_enemy(who, "kill");

        switch(query("attitude"))
        {
        case "friendly":
                command("say 既然" + RANK_D->query_respect(who)
                        + "如此逼迫，莫怪在下不留情！");
                break;
        case "aggressive":
        case "killer":
                command("say " + RANK_D->query_rude(who) +
                        "！明年的今天，就是你的忌日！。");
                break;
        default:
                command("say 好！" + RANK_D->query_rude(who)
                        + "，咱们就一决生死！");
                break;
        }

        return 1;
}

int accept_ansuan(object who)
{
        if (! query("can_speak"))
        {
                kill_ob(who);
                return 1;
        }

        if (this_object()->is_guarder())
                return this_object()->check_enemy(who, "ansuan");

        command(random(2) ? "say 嗯？怎么…" : "say 啊呀，不好！");
        return 1;
}

int accept_touxi(object who)
{
        if (! query("can_speak"))
                return 1;

        if (this_object()->is_guarder())
                return this_object()->check_enemy(who, "touxi");

        command(random(2) ? "say 嗯！怎么…是谁！" : "say 啊呀…你…");
        return 1;
}

// 为任务提供连接
mixed accept_ask(object who, string topic)
{
        if (this_object()->is_quester())
                return QUEST_D->accept_ask(this_object(), who, topic);

        if (! this_object()->is_waiter()
           && (who->query("ultra_quest/next_npc") == this_object()->name()
           || who->query("ultra_quest/npc") == this_object()->name()))
                return ULTRA_D->ask_information(this_object(), who, topic);
}

// 接收物品
int accept_object(object who, object ob)
{
        if (this_object()->is_quester())
                return QUEST_D->accept_object(this_object(), who, ob);

        if (! this_object()->is_waiter()
           && (who->query("ultra_quest/next_npc") == this_object()->name()
           || who->query("ultra_quest/quest/obj") == this_object()->name()))
                return ULTRA_D->accept_object(this_object(), who, ob);
}

// 回覆任务人物的应酬
int need_accede(object who)
{
        if (! this_object()->is_waiter()
           && who->query("ultra_quest/quest/obj") == this_object()->name()
           && who->query("ultra_quest/next_npc") == this_object()->name())
                return ULTRA_D->need_accede(this_object(), who);
}

// This function is called by the reset() of the room that creates this
// npc. When this function is called, it means the room demand the npc
// to return its startroom.
int return_home(object home)
{
        // Are we at home already?
        if (! environment() || environment() == home)
                return 1;

        // Are we able to leave?
        if (! living(this_object()) || is_fighting()
           || ! mapp(environment()->query("exits")))
                return 0;

        // Leave for home now.
        message("vision", this_object()->name() + "急急忙忙地离开了。\n",
                environment(), this_object());

        return move(home);
}

// In this function, the npc will scan itself wether there is
// someting to do.
void scan()
{
        object me;

        me = this_object();

        if (! environment() || ! living(me)) return;

        if (me->is_coagent() && me->is_helping() && ! me->is_fighting())
        {
                // finish helping
                me->finish_help();
        }

        if (heal_self()) return;

        chat();
}

// Here, the NPC will process the heal/recover.
int heal_self()
{
        mapping my;
        int cost;

        if (is_busy() || is_fighting())
                // 正忙？
                return 0;

        if (query("not_living"))
                // 非生物
                return 0;

        if (! query_skill_mapped("force"))
                // 没有激发内功
                return 0;

        if (query_temp("no_exert"))
                // 特殊情况禁止使用内功
                return 0;

        my = query_entire_dbase();
        if (my["neili"] < 50)
                return 0;

        if (my["jing"] < my["eff_jing"] * 8 / 10)
        {
                // 精气太少
                exert_function("regenerate");
                return 1;
        }

        if (my["qi"] < my["eff_qi"] * 8 / 10 &&
            query_skill("force") >= 150)
        {
                // 气血不够充沛并且内功等级高
                exert_function("recover");
                return 1;
        }

        if (my["eff_qi"] < my["max_qi"])
        {
                // 受伤了
                exert_function("heal");
                return 1;
        }

        if (my["eff_jing"] < my["max_jing"])
        {
                // 精受到了损失
                exert_function("inspire");
                return 1;
        }

        if (my["neili"] < my["max_neili"] - 10)
        {
                // 内力不够充沛，打坐恢复
                cost = my["max_neili"] - my["neili"];
                if (cost > my["qi"] / 2) cost = my["qi"] / 2;
                command(sprintf("dazuo %d", cost));
                return 1;
        }

        return 0;
}

// This is the chat function dispatcher. If you use function type chat
// message, you can either define your own functions or use the default
// ones.
int chat()
{
        string *msg;
        int chance, rnd;

        if (is_busy())
                return 0;

        if (! chance = (int)query(is_fighting()? "chat_chance_combat": "chat_chance"))
                return 0;

        if (arrayp(msg = query(is_fighting()? "chat_msg_combat": "chat_msg")))
        {
                if (random(120) < chance)
                {
                        rnd = random(sizeof(msg));
                        if (stringp(msg[rnd]))
                                say(msg[rnd]);
                        else if (functionp(msg[rnd]))
                                return evaluate(msg[rnd]);
                }
                return 1;
        }
}

// Default chat function: Let the npc random move to another room.
int random_move()
{
        mapping exits;
        string *dirs;

        if (! mapp(exits = environment()->query("exits")) ||
	    ! sizeof(exits))
                return 0;
        dirs = keys(exits);
        command("go " + dirs[random(sizeof(dirs))]);
}

// Default chat function: Let the npc cast his/her enabled spells
void cast_spell(string spell)
{
        string spell_skill;

        if (stringp(spell_skill = query_skill_mapped("spells")))
                SKILL_D(spell_skill)->cast_spell(this_object(), spell);
}

// Default chat function: Let the npc exert his/her enabled force
int exert_function(string func)
{
        string force_skill;

        if (! stringp(force_skill = query_skill_mapped("force")))
                return 0;

        // 特殊情况禁止使用内功
        if (this_object()->query_temp("no_exert"))
                return 0;

        if (SKILL_D(force_skill)->exert_function(this_object(), func))
                return 1;

        return SKILL_D("force")->exert_function(this_object(), func);
}

// Default chat function: Let the npc perform special action with 
// his/her enabled martial art
int perform_action(string action)
{
//      object weapon;
        string martial_skill, act;

        if (sscanf(action, "%s.%s", martial_skill, act) != 2)
                return 0;

        // 特殊情况禁止使用外功
        if (this_object()->query_temp("no_perform"))
                return 0;

        martial_skill = query_skill_mapped(martial_skill);
        if (stringp(martial_skill))
                return SKILL_D(martial_skill)->perform_action(this_object(), act);              
}

// Check the player wether is belong a family
int check_family(object ob, string fam)
{
        if (ob->query("family/family_name") == fam)
                return 1;

        if (! ob->query("family/family_name") &&
            ob->query("born_name") == fam)
                return 1;

        return 0;
}

// when remove
void remove()
{
        function *fun;

        if (functionp(fun = query_temp("override/destruct", 1)))
                catch(evaluate(fun, this_object()));

        ::remove();
}

// environment destruct
void move_or_destruct()
{
        remove();
}