// huang 黄裳

#include <ansi.h>

inherit NPC;
inherit F_MASTER;
inherit F_NOCLONE;

mixed ask_opinion();
mixed ask_skill();

#define ULTRA_OPINION   "宗师"
#define OPINION_TYPE    HIY "拳脚功夫" NOR 
#define MY_OPINION      "unarmed"

string  *my_opinions = ({ "unarmed", "finger",
                          "strike", "cuff", "hand", "claw" });

// 该头文件必须在这里嵌入
#include "ultra.h"

void create()
{
        set_name("黄裳", ({ "huang shang", "huang" }) );
        set("title", HIY "大宗师" NOR);
        set("gender", "男性");
        set("age", 92);
        set("long", "此人气度闲雅，看不出武功高低。\n");
        set("attitude", "peaceful");
        set("str", 32);
        set("int", 39);
        set("con", 37);
        set("dex", 32);

        set("max_qi", 20000);
        set("max_jing", 20000);
        set("neili", 30000);
        set("max_neili", 30000);
        set("jiali", 100);

        set("combat_exp", 50000000);

        set("inquiry", ([
                "九阴真经" : "想不到当年我随手写的一本武学心得竟成为危害江湖的不祥之物。",
                "评价"     : (: ask_opinion :),
                "opinion"  : (: ask_opinion :),
                "武学修养" : "武学修养(martial-cognize)不到家，还谈什么武功呢？",
                "摄心大法" : (: ask_skill :),
        ]));

        set_skill("unarmed", 500);
        set_skill("finger", 500);
        set_skill("claw", 500);
        set_skill("strike", 500);
        set_skill("hand", 500);
        set_skill("cuff", 500);
        set_skill("parry", 500);
        set_skill("dodge", 500);
        set_skill("force", 500);
        set_skill("jiuyin-shengong", 500);
        set_skill("martial-cognize", 500);
        set_skill("literate", 200);

        map_skill("parry", "jiuyin-shengong");
        map_skill("force", "jiuyin-shengong");
        map_skill("dodge", "jiuyin-shengong");
        map_skill("unarmed", "jiuyin-shengong");
        map_skill("finger", "jiuyin-shengong");
        map_skill("strike", "jiuyin-shengong");
        map_skill("hand", "jiuyin-shengong");
        map_skill("cuff", "jiuyin-shengong");
        map_skill("claw", "jiuyin-shengong");

        prepare_skill("claw", "jiuyin-shengong");
        prepare_skill("cuff", "jiuyin-shengong");

        set("opinion/ultra",  1);
        set("opinion/master", 1);

        set("rank_info/self", "某家");

        setup();
        carry_object("/clone/cloth/cloth")->wear();

        set("startroom", "/d/dali/lushui");
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

mixed ask_opinion()
{
        object me;
        object ob;

        me = this_player();

        if (me->query("combat_exp") < 200000)
                return "呵呵，你这点武功还谈什么评价？";

        if (me->query("opinion/" MY_OPINION) == ULTRA_OPINION)
                return "哈哈，你拳脚方面的修为已经称得上是宗师了！咱们要不要过过招？";

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

        switch(me->query_temp("want_opinion/huang"))
        {
        case 0:
                command("look " + me->query("id"));
                command("say 好吧，你空手攻我一招，我看看你的水平如何。");
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

        me->add_temp("want_opinion/huang", 1);
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
        action = SKILL_D(sp)->query_action(me, 0);
        if (mapp(action))
                lvl += (action["force"] + action["attack"] +
                        action["parry"] + action["dodge"] - 150) / 15;
        return lvl;
}

void do_congration(object me)
{
        command("chat 恭喜这位" + RANK_D->query_respect(me) + "，不过武"
                "道永无止境，还望继续努力啊！");
}

int accept_hit(object me)
{
        if (me->query_temp("want_hit/huang") >= 2)
        {
                command("heng");
                command("say 事不过三，你要找死那就去死吧！");
                kill_ob(me);
                return 1;
        }

        command("shake");
        command("say 这位" + RANK_D->query_respect(me) + "，"
                "练武之人切忌贸然挑衅。");
        me->add_temp("want_hit/huang", 1);
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

        if (! me->query_temp("want_opinion/huang"))
        {
                command("say 平白无故动什么手？");
                return 0;
        }

        if (objectp(weapon = me->query_temp("weapon")))
        {
                command("say 把你手中的" + weapon->name() + NOR +
                        CYN "给我放下！" NOR);
                return 0;
        }

        if (me->query("qi") * 100 / me->query("max_qi") < 80||
            me->query("jing") * 100 / me->query("max_jing") < 80)
        {
                command("say 你现在状态不佳，等休息好了再说吧！");
                return 0;
        }

        command("nod");
        COMBAT_D->do_attack(me, this_object(), 0);
        COMBAT_D->do_attack(this_object(), me, 0);

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
        if (me->query("character") != "光明磊落")
        {
                command("say 大丈夫处世，不论善恶行事一定要光"
                        "明磊落，你生性不是这种人。");
                return -1;
        }

        if (skill == "martial-cognize")
                return 1;

        if (! ultrap(me))
        {
                command("say 想学我的九阴神功？你还不够资格，"
                        "等你成了大宗师再说吧！");
                return -1;
        }

        if (me->query_skill(skill, 1) >= 180)
        {
                command("say 够了！我就教你到这里吧，武功还是"
                        "要靠自己多研究才是！");
                return -1;
        }

        if (skill != "jiuyin-shengong")
                return 1;

        if (me->query_temp("can_learn/huang/jiuyin-shengong"))
                return 1;

        me->set_temp("can_learn/huang/jiuyin-shengong", 1);
        command("nod");
        command("say 很好，我就传你九阴神功吧，可不要忘记做人"
                "的根本！");
        return 1;
}
*/

void unconcious()
{
        message("vision", "\n"HIR + name() + "脸色一变，吐了一口鲜"
                "血，身形一闪，消逝不见。\n\n" NOR, environment());
        command("chat 罢！罢！罢！老夫去也！");
        destruct(this_object());
}

mixed ask_skill()
{
        object me;
        
        me = this_player();

        if (me->query("can_perform/jiuyin-shengong/xin"))
        {
             command("say 你不是已经会了吗？");
             return 1;
        }

        if (! me->query("can_learn/jiuyin-shengong/xin"))
        {               
               message_sort(HIM "\n黄裳叹道：“当年我随手写了一本武学心得，名曰「九阴真经」，本欲"
                            "留与后人研究武学之用，不料竟成为危害江湖的不祥之物。如果阁下能将其上、"
                            "下两册收集齐交还与我，我便传你绝招「摄心大法」。\n", me);
               command("tan");

               return "阁下意下如何？";
        }

        
        if (me->query_skill("jiuyin-shengong", 1) < 240)
        {
               command("say 你九阴神功火候还不够，我还不能传你这招！");
               return 1;
        }
        if (me->query_skill("martial-cognize", 1) < 240)
        {
               command("say 你武学修养不足，还是下去多磨练一下吧！");
               return 1;
        }
        if (  ! me->query("can_perform/jiuyin-shengong/shou")
           || ! me->query("can_perform/jiuyin-shengong/zhi")
           || ! me->query("can_perform/jiuyin-shengong/zhua")
           || ! me->query("can_perform/jiuyin-shengong/zhang") )
        {
               command("shake");
               command("say 等你将九阴神功其他绝招领悟后再来找我吧！");
               return 1; 
        }

        command("nod");
        command("say 很好，很好！");
        command("say 既然这样我就传你摄心大法！");
        message_sort(HIC "\n黄裳将$N" HIC "呼自身旁，对着$N" HIC "耳边小声嘀咕了几句。"
                       "黄裳不时地做出各种奇怪的表情，$N" HIC "边听边看，良久，$N" HIC
                       "一声长啸，胸中疑虑顿然消失，再无困扰 ……\n", me);
        command("haha");
        
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("jiuyin-shengong"))
                me->improve_skill("jiuyin-shengong", 1500000);
        if (me->can_improve_skill("martial-cognize"))
                me->improve_skill("martial-cognize", 1500000);

        tell_object(me, HIG "你学会了「摄心大法」！\n" NOR);
        me->set("can_perform/jiuyin-shengong/xin", 1);
        return 1;
}
void die()
{
        message("vision", "\n"HIR + name() + "大叫一声，狂吐了一口鲜"
                "血，身形一闪，就此不见。\n\n" NOR, environment());
        command("chat 老夫去也！");
        destruct(this_object());
}

int accept_object(object me, object ob) 
{
        if (base_name(ob) != "/clone/lonely/book/zhenjing1"
          && base_name(ob) != "/clone/lonely/book/zhenjing2")
        {
               command("say 你给我这种东西干什么？");
               return 0;
        } 
      
        if (base_name(ob) == "/clone/lonely/book/zhenjing1")
        {
               command("nod");
               command("say 很好，很好！");
               if (me->query("give_zhenjing2"))
               {
                     command("haha");
                     command("say 既然这样我就传你绝招，你可以随时来问我！");
                     tell_object(me, HIG "黄裳决定传你「摄心大法」。\n" NOR); 
                     me->set("can_learn/jiuyin-shengong/xin", 1);
                     me->delete("give_zhenjing1");
                     me->delete("give_zhenjing2");
                     destruct(ob);
                     return 1;
               }
               me->set("give_zhenjing1", 1);
               command("say 还有一本「九阴真经下册」，你尽快找到交还与我！");
               destruct(ob);
               return 1;
        } 

        if (base_name(ob) == "/clone/lonely/book/zhenjing2")
        {
               command("nod");
               command("say 很好，很好！");
               if (me->query("give_zhenjing1"))
               {
                     command("haha");
                     command("say 既然这样我就传你绝招，你可以随时来问我！");
                     tell_object(me, HIG "黄裳决定传你「摄心大法」。\n" NOR); 
                     me->set("can_learn/jiuyin-shengong/xin", 1);
                     me->delete("give_zhenjing1");
                     me->delete("give_zhenjing2");
                     destruct(ob);
                     return 1;
               }
               me->set("give_zhenjing2", 1);
               command("say 还有一本「九阴真经上册」，你尽快找到交还与我！");
               destruct(ob);
               return 1;
        } 
 
}