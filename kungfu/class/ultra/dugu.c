// huang 黄裳

#include <ansi.h>

inherit NPC;
inherit F_MASTER;
inherit F_NOCLONE;

mixed ask_opinion();

#define ULTRA_OPINION   "宗师"
#define OPINION_TYPE    HIY "兵器功夫" NOR 
#define MY_OPINION      "weapon"

string  *my_opinions = ({ "sword", "blade", "staff", "hammer",
                          "club", "whip",  "dagger", });

// 该头文件必须在这里嵌入
#include "ultra.h"

void check_weapon();

void create()
{
        set_name("独孤求败", ({ "dugu qiubai", "dugu" }) );
        set("title", HIC "大宗师" NOR);
        set("gender", "男性");
        set("age", 48);
        set("long", "此人诚恳敦厚，眉目菱角分明，气宇轩昂。\n");
        set("attitude", "peaceful");
        set("str", 38);
        set("int", 39);
        set("con", 32);
        set("dex", 33);

        set("max_qi", 20000);
        set("max_jing", 20000);
        set("neili", 30000);
        set("max_neili", 30000);
        set("jiali", 100);

        set("combat_exp", 50000000);

        set("inquiry", ([
                "独孤九剑" : "我把天下武功的变化归结在九剑之中，算不得是剑法，若拘\n"
                             "泥于形势就无法理解其中奥妙。\n"
                             "独孤九剑真正的精妙之处不在于其剑招，而是其" HIY "剑意" NOR + CYN "。",
                "剑意"     : "剑招乃其形，而剑意乃其神，吾花费毕生经历于华山一山洞\n"
                             HIY"空室" NOR + CYN"中参悟出独孤九剑之剑意，并将其笔录在「" HIY "独孤九剑残"
                             "本" NOR + CYN"」" NOR + CYN "内。\n" NOR,
                "空室"     : "穿过我身后的山洞就会发现一个峭壁，我将残本藏于其间的\n"
                             "山洞内，并请高手匠人设计出六把不同锁将其锁住，每把琐"
                             "连接着一个开锁\n的机关，机关藏于六个不同的石室内，须得"
                             "将所有" HIY "锁" NOR + CYN "打开方能进入空室。\n" NOR,
                "锁"       : "年深日久，开锁的方法我已不记得了。我只记得如果石门\n"
                             "上的六把火炬都点燃了，石门上的锁也就开了。\n",
                "无招胜有招" : "那就是独孤九剑的最高境界！\n", 
                "独孤九剑残本" : "如果你能拿来给话我到是可以把独孤九剑中的精妙之处传\n授于你。\n", 
                "评价"     : (: ask_opinion :),
                "opinion"  : (: ask_opinion :),
                "武学修养" : "武学修养(martial-cognize)乃武术大义，可谓是以一通通百通！",
                
        ]));

        set_skill("unarmed", 500);
        set_skill("sword", 500);
        set_skill("blade", 500);
        set_skill("staff", 500);
        set_skill("hammer", 500);
        set_skill("club", 500);
        set_skill("whip", 500);
        set_skill("dagger", 500);
        set_skill("throwing", 500);
        set_skill("parry", 500);
        set_skill("dodge", 500);
        set_skill("force", 500);
        set_skill("never-defeated", 500);
        set_skill("martial-cognize", 500);

        map_skill("sword", "never-defeated");
        map_skill("blade", "never-defeated");
        map_skill("staff", "never-defeated");
        map_skill("hammer", "never-defeated");
        map_skill("club", "never-defeated");
        map_skill("whip", "never-defeated");
        map_skill("dagger", "never-defeated");
        map_skill("parry", "never-defeated");
        map_skill("dodge", "never-defeated");
        map_skill("force", "never-defeated");

        set("opinion/ultra",  1);
        set("opinion/master", 1);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: check_weapon :),
        }) );

        set("rank_info/self", "在下");

        setup();
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/zhujian")->wield();

        set("startroom", "/d/huashan/shandong");
        check_clone();
}

void init()
{
        object me;

        if (! interactive(me = this_player()))
                return;

        me->delete_temp("want_opinion");
        if (ultrap(me))
        {
                message_vision(CYN "$N" CYN "微微一笑，对$n"
                               CYN "点了点头。\n" NOR,
                               this_object(), me);
        }
}

void check_weapon()
{
        if (objectp(query_temp("weapon")))
                return;

        message_vision(CYN "$N" CYN "长叹一口气道：我$N"
                       CYN "多年来兵器还从未离过手，罢！罢"
                       "了！我去也！\n" NOR, this_object());
        destruct(this_object());
}

mixed ask_opinion()
{
        object me;
        object ob;

        me = this_player();

        if (me->query("combat_exp") < 200000)
                return "呵呵，你这点武功还谈什么评价？";

        if (me->query("opinion/" MY_OPINION) == ULTRA_OPINION)
                return "哈哈，你兵器方面的修为已经称得上是宗师了！咱们要不要过过招？";

        if (is_fighting(me))
                return "哈哈，废什么话，打赢了我，你自己给自己评价吧！";

        if (me->is_fighting())
                return "你等会儿吧！待我赶走他们。";

        if (objectp(ob = query_temp("opinion")))
        {
                if (ob == me)
                {
                        command("say 你着什么急？不要烦我。");
                        return 1;
                }

                message_vision(CYN "$N" CYN "正在沉思，没有回答$n"
                               CYN "，只是摆了摆手。\n" NOR,
                               this_object(), me);
                return 1;
        }

        switch(me->query_temp("want_opinion/dugu"))
        {
        case 0:
                command("look " + me->query("id"));
                command("say 好吧，你用兵器攻我一招，我看看你的水平如何。");
                break;
        case 1:
                command("say 不是说让你来一招我看看吗？");
                break;
        case 2:
                message_vision(CYN "$N" CYN "皱眉对$n" CYN
                               "道：“我看你这人是够罗嗦的。”\n" NOR,
                               this_object(), me);
                break;
        case 3:
                command("say 给我闭上你的嘴！");
                return 1;
        }

        me->add_temp("want_opinion/dugu", 1);
        return 1;
}

int calc_level(object me, string skill)
{
        int lvl;
        string sp;
        mapping action;

        lvl = me->query_skill(skill, 1) / 2;
        sp = me->query_skill_mapped(skill);
        if (! sp) return lvl;

        lvl += me->query_skill(sp, 1);
        action = SKILL_D(sp)->query_action(me, me->query_temp("weapon")); 
        if (mapp(action))
                lvl += (action["force"] + action["parry"] + action["dodge"] - 250) / 10;
        return lvl;
}

void do_congration(object me)
{
        command("chat 这位" + RANK_D->query_respect(me) +
                "可要善自珍重，须知强中更有强中手。");
}

int accept_hit(object me)
{
        if (me->query_temp("want_hit/dugu") >= 2)
        {
                command("heng");
                command("say 事不过三，你要找死那就去死吧！");
                kill_ob(me);
                return 1;
        }

        command("shake");
        command("say 这位" + RANK_D->query_respect(me) + "，"
                "练武之人切忌贸然挑衅。");
        me->add_temp("want_hit/dugu", 1);
        return 0;
}

int accept_fight(object me)
{
        object weapon;

        if (me->query("opinion/" MY_OPINION) == ULTRA_OPINION)
        {
                message_vision(CYN "$N" CYN "大喜，对$n" CYN
                               "道：“很好，近年我还没有和宗"
                               "师高手过过招，来吧！”\n" NOR,
                               this_object(), me);
                return 1;
        }

        if (! me->query_temp("want_opinion/dugu"))
        {
                command("say 平白无故动什么手？");
                return 0;
        }

        if (! objectp(weapon = me->query_temp("weapon")))
        {
                command("say 没兵器你动什么手？");
                return 0;
        }

        if (me->query("qi") * 100 / me->query("max_qi") < 80||
            me->query("jing") * 100 / me->query("max_jing") < 80)
        {
                command("say 你现在状态不佳，等休息好了再说吧！");
                return 0;
        }

        command("nod");
        COMBAT_D->do_attack(me, this_object(), weapon);
        COMBAT_D->do_attack(this_object(), me, query_temp("weapon"));

        if (me->query("qi") <= 0)
        {
                message_vision(CYN "\n$N" CYN "摇摇头对$n" CYN
                               "道：“你现在的武功还差得远，连"
                               "我一招都接不住！”\n" NOR,
                               this_object(), me);
                return notify_fail("看来要好好的修炼功夫了。\n");
        }

        call_out("check_opinion", 2, me);
        set_temp("opinion", me);
        me->delete_temp("want_opinion");
        message_vision(CYN "\n$N" CYN "点点头道：“好了，你先等"
                       "会儿，待我想想。”\n" NOR,
                       this_object(), me);
        return notify_fail("看来不能心急，还得等一会儿。\n");
}

int accept_kill(object me)
{
        if (me->query("combat_exp") < 500000)
        {
                message_vision(CYN "$N" CYN "大怒道：“无名小辈捣"
                               "什么乱？给我滚！”说罢一掌把$n" CYN
                               "劈倒在地。\n" NOR, this_object(), me);
                me->unconcious();
                return -1;
        }
        command("sigh");
        command("say 很好！近年还真没有遇到什么敢和我较量的高手！");
        return 1;
}

/*
int recognize_apprentice(object me, string skill)
{
        if (me->query("character") != "狡黠多变")
        {
                command("say 我看你的性格不够机智灵活，不适宜"
                        "向我学习武功，还是算了吧！");
                return -1;
        }

        if (skill == "martial-cognize")
                return 1;

        if (! ultrap(me))
        {
                command("say 想学我的不败神功？你还不够资格，"
                        "等你成了大宗师再说吧！");
                return -1;
        }

        if (me->query_skill(skill, 1) >= 180)
        {
                command("say 够了！我就教你到这里吧，武功还是"
                        "要靠自己多研究才是！");
                return -1;
        }

        if (skill != "never-defeated")
                return 1;

        if (me->query_temp("can_learn/dugu/never-defeated"))
                return 1;

        me->set_temp("can_learn/dugu/never-defeated", 1);
        command("nod");
        command("say 我可以教你我多年领悟出来的不败神功，可是"
                "你能不能学，还要看你的机缘了！");
        return 1;
}
*/

void unconcious()
{
        message("vision", "\n"HIR + name() + "脸色一变，吐了一口鲜"
                "血，身形一闪，消逝不见。\n\n" NOR, environment());
        command("chat 罢！罢！罢！在下去也！");
        destruct(this_object());
}

void die()
{
        message("vision", "\n"HIR + name() + "大叫一声，狂吐了一口鲜"
                "血，身形一闪，就此不见。\n\n" NOR, environment());
        command("chat 在下去也！");
        destruct(this_object());
}

int accept_object(object me, object ob)
{

        if (base_name(ob) != "/clone/lonely/book/dugubook")
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (me->query_skill("dugu-jiujian", 1) < 340)
        {
                command("shake"); 
                command("say 可惜，可惜！你独孤九剑还不够熟练，还无法领悟独孤九剑的精妙之处！");
                destruct(ob);
                return 1;
        }

        if (me->query("can_learn/dugu-jiujian/nothing"))
        {
                command("nod");
                command("say 你已经领悟了独孤九剑之精髓，下去好好练习吧！");
                destruct(ob);
                return 1;
        }

        if (me->query("int") < 39)
        {
                command("say 你先天悟性不足，不知道你是怎么学的独孤九剑！\n");
                return 1;
        }

        if (me->query("con") < 36 
           && me->query("dex") < 36)
        {
                command("say 你先天身法和根骨都不足，无法体会独孤九剑的精髓！\n");
                return 1;
        }
        // 开始传授独孤九剑之无招
        command("nod");
        command("say 不错，不错！既然如此，我就将独孤九剑之精髓传授于你。");
        command("say 独孤九剑最精妙之处已经不是招式，而是一种" HIY "境界" NOR + CYN "！");
        command("say 独孤九剑讲究后发制人，不拘泥于任何招式，随心而发，随心而收，达到一\n"
                     "种" HIY "无招胜有招" NOR + CYN "的境界！");
        command("say 明白了？");

        me->set("can_learn/dugu-jiujian/nothing", 1);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("dugu-jiujian"))
                me->improve_skill("dugu-jiujian", 1500000);
        if (me->can_improve_skill("dugu-jiujian"))
                me->improve_skill("dugu-jiujian", 1500000);
        if (me->can_improve_skill("dugu-jiujian"))
                me->improve_skill("dugu-jiujian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->improve_skill("martial-cognize", 1500000);  
        me->improve_skill("martial-cognize", 1500000);  

        tell_object(me, HIG "你学会了独孤九剑之「无招」。\n" NOR);

        destruct(ob);
        return 1;
}
