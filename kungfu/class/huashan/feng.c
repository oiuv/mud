inherit NPC;
inherit F_MASTER;

#include <ansi.h>

mapping po_type = ([ "破剑式" : ({ "sword" }),
                     "破刀式" : ({ "blade" }),
                     "破枪式" : ({ "staff" }),
                     "破鞭式" : ({ "hammer", "club", "dagger" }),
                     "破索式" : ({ "whip" }),
                     "破掌式" : ({ "unarmed", "finger", "claw",
                                   "strike", "hand", "cuff" }),
                     "破箭式" : ({ "throwing" }),
                     "破气式" : ({ "force" }), ]);

int check_skill(string skill);
mixed teach_lonely_sword();

void create()
{
        set_name("风清扬", ({ "feng qingyang", "feng", "qingyang" }));
        set("title", "华山剑宗长老");
        set("nickname", HIW "剑气冲霄" NOR);
        set("long", @LONG
这便是当年名震江湖的华山名宿风清扬。他身
著青袍，神气抑郁脸如金纸。身材瘦长，眉宇
间一直笼罩着一股淡淡的忧伤神色，显然对当
年的剑气之争一直难以忘怀。
LONG);
        set("gender", "男性");
        set("age", 68);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 40);
        set("int", 40);
        set("con", 40);
        set("dex", 40);
        set("max_qi", 6000);
        set("max_jing", 5000);
        set("neili", 6500);
        set("max_neili", 6500);
        set("jiali", 200);
        set("combat_exp", 4000000);

        set_skill("force", 300);
        set_skill("zixia-shengong", 300);
        set_skill("huashan-xinfa", 280);
        set_skill("dodge", 300);
        set_skill("feiyan-huixiang", 300);
        set_skill("parry", 320);
        set_skill("sword", 320);
        set_skill("dugu-jiujian", 320);
        set_skill("strike", 280);
        set_skill("hunyuan-zhang", 280);
        set_skill("cuff", 280);
        set_skill("poyu-quan", 280);
        set_skill("literate", 280);
        set_skill("martial-cognize", 320); 

        map_skill("cuff", "poyu-quan");
        map_skill("force", "zixia-shengong");
        map_skill("dodge", "feiyan-huixiang");
        map_skill("parry", "dugu-jiujian");
        map_skill("sword", "dugu-jiujian");
        map_skill("strike", "hunyuan-zhang");

        prepare_skill("cuff", "poyu-quan");
        prepare_skill("strike", "hunyuan-zhang");

        create_family("华山剑宗", 0, "高人");

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: perform_action, "sword.po" :),
                (: perform_action, "sword.qi" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set("can_perform/dugu-jiujian", ({ "sword", "blade", "staff",
                                           "hammer", "club", "dagger",
                                           "whip", "unarmed", "finger",
                                           "claw", "strike", "hand",
                                           "cuff", "force", "throwing" }));

        set("no_teach", ([
                "dugu-jiujian" : (: teach_lonely_sword :),
        ]));
        set_temp("apply/damage", 200);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();
        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/changjian")->wield();
}

mixed teach_lonely_sword()
{
        object me;

        me = this_player();
        if (me->query_skill("dugu-jiujian", 1) > 100)
        {
                if (me->query_temp("feng_has_told"))
                {
                        command("say 你自己好好练吧！");
                        return -1;
                }

                command("pat " + me->query("id"));
                command("say 这套剑法要靠自己勤练，以后你自己多加钻研吧！");
                me->set_temp("feng_has_told", 1);
                return -1;
        }

        if (me->query_temp("learnd_lonely_sword"))
                return 0;

        me->set_temp("learnd_lonely_sword", 1);
        command("say 很好，很好。这门剑法重在剑意，不在招式。");
        command("say 倘若学习，切不可拘泥于形式。");
        return 0;
}

void attempt_apprentice(object ob)
{
        if (ob->query("family/family_name") == "华山派"
           || ob->query("family/family_name") == "华山剑宗")
        {
                command("say 走开！华山的弟子我一概不见。");
                return;
        }

        command("say 我不收徒，你另请高明吧。");
}

int check_skill(string skill)
{
        if (skill != "sword" && skill != "dugu-jiujian")
        {
                command("say 我只懂剑法，你想学就学，不想学就算了。");
                return -1;
        }
        return 1;
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("can_learn/feng/dugu-jiujian"))
                return check_skill(skill);

        if (ob->query("can_learn/feng/sword")
           && skill != "dugu-jiujian")
        {
                if (skill == "sword")
                        return 1;

                command("say 教你点基本剑法是看得起你，少跟我啰嗦！");
                return -1;
        }

        if (ob->query_temp("have_asked_feng"))
        {
                command("say 还不快滚！");
                return -1;
        }

        if (ob->query("character") == "阴险奸诈"
           || ob->query("character") == "心狠手辣")
        {
                command("heng");
                command("say 不想死的就给我滚！");
                ob->set_temp("have_asked_feng", 1);
                return -1;
        }

        if (ob->query("character") == "光明磊落")
        {
                command("hmm");
                command("say 你天性不坏，可是却不适合练习这套剑法。");
                ob->set_temp("have_asked_feng", 1);
                return -1;
        }

        if (ob->query("shen") < -100000
           || ob->query("shen") > 100000
           || ob->query("weiwang") > 10000)
        {
                command("say 我风某从不和成名人士打交道，你走吧。");
                ob->set_temp("have_asked_feng", 1);
                return -1;
        }

        if (ob->query("int") < 30)
        {
                command("sneer");
                command("say 你这个呆头鹅，忒笨了点，走吧。");
                ob->set_temp("have_asked_feng", 1);
                return -1;
        }

        if (ob->query("int") < 35)
        {
                command("look " + ob->query("id"));
                command("say 你倒是不算笨，有点小聪明，不过…还是差得远啊。");
                ob->set_temp("have_asked_feng", 1);
                return -1;
        }

        if (ob->query_skill("sword", 1) < 100)
        {
                command("say 你人虽不错，可是你的对剑法的理解也未免太差了。");
                return -1;
        }

        if (ob->query("int") < 39)
        {
                if (skill == "sword")
                {
                        command("say 好吧，我就教你一点关于剑法的知识。");
                        ob->set("can_learn/feng/sword", 1);
                        return 1;
                }

                if (skill != "dugu-jiujian")
                {
                        command("say 我只会剑法，要学其它的本事找别的师傅去吧！");
                        return -1;
                }

                command("sigh");
                command("say 你这人算是聪明，可离独孤九剑还是差之甚远。");
                return -1;
        }

        if (check_skill(skill) == -1)
                return -1;

        message_sort(HIW "\n$N" HIW "点了点头，对$n" HIW "说道：“甚"
                     "好，甚好。虽然我不收徒，不过看你天资实在不错，"
                     "就传你一点剑法吧。这套独孤九剑共分为九式，我先"
                     "传你总诀式，其他破剑式、破刀式、破枪式、破鞭式"
                     "、破索式、破掌式、破箭式、破气式我随后一一分解"
                     "与你听。”\n" NOR, this_object(), ob);

        tell_object(ob, HIC "\n风清扬同意传授你「独孤九剑」。\n" NOR);
        ob->set("can_learn/feng/dugu-jiujian", 1);
        ob->improve_skill("martial-cognize", 1500000);
        return 1;
}

int accept_ask(object me, string topic)
{
        string *learned, *try_to;

        if (! topic || undefinedp(try_to = po_type[topic]))
                return 0;

        if (! (int)me->query_skill("dugu-jiujian", 1))
        {
                command("say 你会独孤九剑么？就向我问这个？");
                return 1;
        }

        learned = me->query("can_perform/dugu-jiujian");
        if (! arrayp(learned))
                learned = ({ });
        if (member_array(try_to[0], learned) != -1)
        {
                command("say 你不是已经学会" + topic + "了么？");
                return 1;
        }

        command("say 好吧，" + topic + "的要诀你要听仔细了。");
        if (me->query("potential") - me->query("learned_points") < 10)
        {
                me->set("learned_points", me->query("potential"));
                tell_object(me, HIG "你听了风清扬的教导，颇觉迷茫，看"
                                "来是潜能不够了。\n" NOR);
                return 1;
        }

        me->add("learned_points", 10);
        if (random(2))
        {
                write(HIY "你听了风清扬的教导，颇有心得。\n" NOR);
                return 1;
        }

        learned -= try_to;
        learned += try_to;
        me->set("can_perform/dugu-jiujian", learned);
        tell_object(me, HIC "你学会了独孤九剑之「" + topic + "」。\n");
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("dugu-jiujian"))
                me->improve_skill("dugu-jiujian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        return 1;
}
